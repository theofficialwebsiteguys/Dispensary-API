// API ROUTE: ./api/businesses
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Business = require('../models/business')
const sequelize = require('../db')


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
      throw new AppError('Not Found', 404, { field: 'business', issue: 'Business Not Found' });
    }

    res.json(business);
  } catch (error) {
    next(error)
  }
};


exports.registerBusiness = async (req, res, next) => {
  try {
    console.log(req.body)
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
    res.status(200).json({ message: `Business with ID ${businessId} deleted successfully` })

  } catch (error) {
    next(error)
  }
}
