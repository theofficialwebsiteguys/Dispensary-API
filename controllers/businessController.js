// API ROUTE: ./api/businesses
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Business = require('../models/business')
const sequelize = require('../db')


exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.findAll();
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: `Error fetching businesses: ${error}` });
  }
};


exports.getBusinessById = async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);
    if (business) {
      res.json(business);
    } else {
      res.status(404).json({ error: 'Business not found' });
    }
  } catch (error) {
    res.status(500).json({ error: `Error fetching business: ${error}` });
  }
};


exports.registerBusiness = async (req, res) => {
  try {
    console.log(req.body)
    let { name } = req.body;

    const newBusiness = await Business.create({ name });

    res.status(201).json(newBusiness);
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};
