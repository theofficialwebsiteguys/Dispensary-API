// API ROUTE: ./api/businesses
const Business = require('../models/business');
const AppError = require('../toolbox/appErrorClass');


exports.getAllBusinesses = async (req, res, next) => {
  try {
    const businesses = await Business.findAll();

    if(!businesses){
      throw new AppError('Not Found', 404, { field: 'businesses', issue: 'Error fetching businesses' });
    }

    res.json(businesses);
  } catch (error) {
    next(error)
  }
};


exports.getBusinessById = async (req, res, next) => {
  try {
    const business = await Business.findByPk(req.params.id);

    if(!business){
      throw new AppError('Not Found', 404, { field: 'business id', issue: 'Business Not Found' });
    }

    res.json(business);
  } catch (error) {
    next(error)
  }
};


exports.registerBusiness = async (req, res, next) => {
  try {
    let { name } = req.body;

    const newBusiness = await Business.create({ name });

    if(!newBusiness){
      throw new AppError('Server Error', 500, { field: 'newBusiness', issue: 'Error creating Business' });
    }

    res.status(201).json(newBusiness);
  } catch (error) {
    next(error)
  }
};


exports.deleteBusiness = async (req, res, next) => {
  const businessId = req.params.id

  try {
    const business = await Business.findByPk(businessId)

    if (!business) {
      throw new AppError('Not Found', 404, { field: 'result', issue: 'Business Not Found' });
    }

    await business.destroy()
    res.status(200).json({ message: `Business with ID ${businessId} deleted successfully` , business: business})

  } catch (error) {
    next(error)
  }
}


exports.updateBusiness = async (req, res, next) => {
  // destructure all variables from the business model, add new vars as the model's columns grow
  let {id, name, api_key} = req.body 

  try {
    const business = await Business.findByPk(id)

    if (!business) {
      throw new AppError('Not Found', 404, { field: 'business id', issue: 'Business Not Found' });
    }

    const updateData = {}

    // check for each field if it was provided in req.body
    if (Object.hasOwn(req.body, 'name')) updateData.name = name
    if (Object.hasOwn(req.body, 'api_key')) updateData.api_key = api_key

    await business.update(updateData)

    res.status(200).json({
      message: 'Business updated successfully',
      business,
    });
  }
  catch (error) {
    next(error)
  }
}
