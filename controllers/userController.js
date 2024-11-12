// API ROUTE: ./api/users
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const sequelize = require('../db')

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
};

// Create a new user
exports.registerUser = async (req, res) => {
  try {
    console.log(req.body)
    const { fname, lname, email, password } = req.body;
    const newUser = await User.create({ fname, lname, email, password });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: `${error}` });
  }
};
