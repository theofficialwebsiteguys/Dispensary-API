// controllers/userController.js
const axios = require('axios');
require('dotenv').config()

exports.getAllProducts = async (req, res) => {
  try {
    const limit = 100;
    let skip = 0;
    let total = 0;
    const products = [];

    const venueId = req.query.venueId;

    const extractTHCAndDescription = (description) => {
      if (!description) return { thc: null, desc: '' };
    
      // Remove HTML tags for clean text
      const cleanDescription = description.replace(/<\/?[^>]+(>|$)/g, '').trim();
    
      // Match THC percentage, including decimals (e.g., "92.2% THC")
      const thcMatch = cleanDescription.match(/(\d{1,3}(\.\d{1,2})?% THC)/i);
      const thc = thcMatch ? thcMatch[0] : null;
    
      // Remove THC from description if it exists
      const adjustedDescription = thc
        ? cleanDescription.replace(thc, '').trim()
        : cleanDescription;
    
      return { thc, desc: adjustedDescription };
    };
    

    const fetchPage = async () => {
      const response = await axios.get(
        `https://api.dispenseapp.com/2023-03/products`,
        {
          params: {
            venueId,
            limit,
            skip,
          },
          headers: {
            'x-dispense-api-key': process.env.FLOWER_POWER_API_KEY,
          },
        }
      );

      const { data, count } = response.data;

      if (data) {
        const currentProducts = data
          .filter((item) => item.quantity > 0) // Only include products with quantity > 0
          .map((item) => {
            const { thc, desc } = extractTHCAndDescription(item.description || '');
            
            return {
              id: item.id,
              category: item.cannabisComplianceType || item.cannabisType || '',
              title: item.name || '',
              desc,
              brand: item.brand?.name || '',
              strainType: item.cannabisStrain || '',
              thc, // Extracted THC percentage or null
              weight: item.weightFormatted || '',
              price: item.price || '',
              image: item.image || item.images?.[0] || '',
            };
          });

        products.push(...currentProducts);
        skip += limit;
        total = count;

        if (skip < total) {
          await fetchPage(); // Recursively fetch the next page
        }
      }
    };

    await fetchPage(); // Start fetching pages
    res.json(products); // Send the final products list as the response
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
