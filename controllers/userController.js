// controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.register = async (req, res) => {
  const { username, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = await User.create(username, passwordHash);
  res.status(201).json({ userId });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findByUsername(username);
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

exports.logout = async (req, res) => {
  res.json({  });
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json({ user });
};

exports.add = async (req, res) => {
  res.json({  });
};


exports.redeem = async (req, res) => {
  res.json({  });
};

