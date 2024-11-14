// API ROUTE: ./api/users
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const sequelize = require('../db')

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: `Error fetching users: ${error}` })
  }
}

// Get a single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ error: `Error fetching user: ${error}` })
  }
}

// Create a new user
exports.registerUser = async (req, res) => {
  try {
    console.log(req.body)
    let { fname, lname, email, dob, phone, password, points, business_id } = req.body

    if (points && points < 0) points = 0 // handle invalid points input

    const newUser = await User.create({ fname, lname, email, dob, phone, password, points, business_id })

    res.status(201).json(newUser)
  } catch (error) {
    res.status(500).json({ error: `${error}` })
  }
}

// Delete an existing user
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.status(200).json({ message: `User with ID ${userId} deleted successfully` });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
}