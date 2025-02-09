// controllers/userController.js
const axios = require('axios');
require('dotenv').config()
const toolbox = require('../toolbox/dispensaryTools')

// exports.getAllProducts = async (req, res) => {
//   try {
//     const limit = 100;
//     let skip = 0;
//     let total = 0;
//     const products = [];

//     const venueId = req.query.venueId;

//     const extractTHCAndDescription = (description) => {
//       if (!description) return { thc: null, desc: '' };
    
//       // Remove HTML tags for clean text
//       const cleanDescription = description.replace(/<\/?[^>]+(>|$)/g, '').trim();
    
//       // Match THC percentage, including decimals (e.g., "92.2% THC")
//       const thcMatch = cleanDescription.match(/(\d{1,3}(\.\d{1,2})?% THC)/i);
//       const thc = thcMatch ? thcMatch[0] : null;
    
//       // Remove THC from description if it exists
//       const adjustedDescription = thc
//         ? cleanDescription.replace(thc, '').trim()
//         : cleanDescription;
    
//       return { thc, desc: adjustedDescription };
//     };
    

//     const fetchPage = async () => {
//       const response = await axios.get(
//         `https://api.dispenseapp.com/2023-03/products`,
//         {
//           params: {
//             venueId,
//             limit,
//             skip,
//           },
//           headers: {
//             'x-dispense-api-key': process.env.FLOWER_POWER_API_KEY,
//           },
//         }
//       );

//       const { data, count } = response.data;

//       if (data) {
//         const currentProducts = data
//           .filter((item) => item.quantity > 0) // Only include products with quantity > 0
//           .map((item) => {
//             const { thc, desc } = extractTHCAndDescription(item.description || '');

//             // Determine if the item is a vaporizer
//             const isVaporizer =
//             item.cannabisComplianceType === 'VAPORIZERS' ||
//             item.cannabisType === 'VAPORIZERS';

//             const category = isVaporizer
//             ? 'CONCENTRATES'
//             : item.cannabisComplianceType || item.cannabisType || '';

//             const title = isVaporizer
//               ? (item.name || '').replace(/\b(Vape|Vaporizer)\b\s*\|?/gi, '').trim()
//               : item.name || '';

//             const image = isVaporizer ? '' : item.image || item.images?.[0] || '';
            
//             return {
//               id: item.id,
//               posProductId: item.posProductId,
//               category,
//               title,
//               desc,
//               brand: item.brand?.name || '',
//               strainType: item.cannabisStrain || '',
//               thc, // Extracted THC percentage or null
//               weight: item.weightFormatted || '',
//               price: item.price || '',
//               quantity: item.quantity || 0,
//               image,
//             };
//           });

//         products.push(...currentProducts);
//         skip += limit;
//         total = count;

//         if (skip < total) {
//           await fetchPage(); // Recursively fetch the next page
//         }
//       }
//     };

//     await fetchPage(); // Start fetching pages
//     res.json(products); // Send the final products list as the response
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ error: 'Failed to fetch products' });
//   }
// };


exports.getAllProducts = async (req, res) => {
  try {
    let take = 5000; // Fetch in large batches of 500
    const products = [];
    const alleavesToken = await toolbox.getAlleavesApiToken();

    const extractTHCAndDescription = (description) => {
      if (!description) return { thc: null, desc: '' };

      const cleanDescription = description.replace(/<\/?[^>]+(>|$)/g, '').trim();
      const thcMatch = cleanDescription.match(/(\d{1,3}(\.\d{1,2})?% THC)/i);
      const thc = thcMatch ? thcMatch[0] : null;

      return {
        thc,
        desc: thc ? cleanDescription.replace(thc, '').trim() : cleanDescription
      };
    };

    const fetchAllPages = async (endpoint, filters = []) => {
      let skip = 0;
      let allResults = [];
    
      while (true) {
        console.log(`Fetching ${endpoint} with skip=${skip}, take=${take}`);
    
        const response = await axios.post(
          `https://app.alleaves.com/api${endpoint}`,
          {
            skip,
            take,
            filter: {
              logic: "and",
              filters: filters
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${alleavesToken}`,
              'Accept': 'application/json; charset=utf-8',
              'Content-Type': 'application/json; charset=utf-8'
            }
          }
        );
    
        const data = response.data || [];
        if (data.length === 0) break; // Stop if no more results
    
        allResults.push(...data);
        skip += take;
      }
    
      return allResults;
    };
    

    // 1. Fetch all inventory items
    // Fetch inventory items with id_area = 1000 and has_available_inventory = true
    const inventoryData = await fetchAllPages('/inventory/search', [
      { field: 'id_area', value: 1000, operator: 'eq' },
      { field: 'has_available_inventory', value: true, operator: 'eq' }
    ]);

    if (inventoryData.length === 0) {
      console.log('No inventory data found.');
      return res.json([]);
    }

    // 2. Fetch all batch data to determine available quantity
    const batchData = await fetchAllPages('/inventory/batch/search');
    const itemQuantityMap = new Map();
    batchData.forEach(batch => {
      const key = batch.id_item; // Unique product identifier
    
      if (!itemQuantityMap.has(key)) {
        itemQuantityMap.set(key, { quantity: 0 });
      }
    
      // Sum quantities from multiple batches
      itemQuantityMap.get(key).quantity += batch.available;
    });

    // 3. Fetch all product details (including images & descriptions)
    const itemData = await fetchAllPages('/inventory/item/search');
    const itemDetailsMap = new Map();
    itemData.forEach(item => {
      itemDetailsMap.set(item.id_item, {
        image: item.media_list?.[0]?.content || '',
        product_description: item.product_description || ''
      });
    });

    // 4. Process and store product data
    const processedProducts = Array.from(new Map(
      inventoryData
        .filter(item => itemQuantityMap.has(item.id_item) && itemQuantityMap.get(item.id_item).quantity > 0)
        .map(item => {
          const details = itemDetailsMap.get(item.id_item) || {};
          const { thc, desc } = extractTHCAndDescription(details.product_description || '');

          return [
            item.id_item, // Use item ID as the unique key
            {
              id: item.id_item,
              posProductId: item.id_item_group,
              category: (item.category || '').toUpperCase() === 'VAPE' ? 'CONCENTRATES' : (item.category || '').toUpperCase(),
              title: item.item || '',
              desc, // Use cleaned product description from item details
              brand: item.brand || '',
              strainType: item.strain || '',
              thc,
              weight: item.weight_useable
                ? `${item.weight_useable} ${item.weight_useable_uom_short || ''}`
                : '',
              price: item.price_retail_adult_use && item.price_retail_adult_use !== 0 
                ? item.price_retail_adult_use 
                : item.price_retail || '',              
              quantity: itemQuantityMap.get(item.id_item).quantity, // Use merged quantity
              image: item.category.toUpperCase() === 'VAPE' ? '' : details.image || '',
            }
          ];
        })
    ).values());
    

    console.log(`Total products fetched: ${processedProducts.length}`);
    res.json(processedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
