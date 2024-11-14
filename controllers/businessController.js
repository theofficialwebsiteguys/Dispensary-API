// API ROUTE: ./api/businesses
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Business = require('../models/business')
const sequelize = require('../db')

// Get all businesses
exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.findAll();
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: `Error fetching businesses: ${error}` });
  }
};

// Get a single business by ID
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

// Create a new business
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
