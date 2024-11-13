// controllers/userController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { validationResult, body } = require('express-validator');
const { User, Session, BusinessProfile } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET
const SESSION_EXPIRY_HOURS = 168; // e.g., 7 days

exports.register = async (req, res) => {
  const { username, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = await User.create(username, passwordHash);
  res.status(201).json({ userId });
};

exports.login = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
  body('businessId').notEmpty().withMessage('businessId is required'),

  async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, businessId } = req.body;

    try {
      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Incorrect email or password' });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Incorrect email or password' });
      }

      // Verify user's business profile
      const businessProfile = await BusinessProfile.findOne({
        where: { id: businessId, userId: user.id },
      });
      if (!businessProfile) {
        return res.status(404).json({ error: 'No matching business profile' });
      }

      // Create session data
      const sessionId = uuidv4();
      const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
      const sessionToken = jwt.sign({ sessionId, userId: user.id }, JWT_SECRET, {
        expiresIn: `${SESSION_EXPIRY_HOURS}h`,
      });

      // Save session in the database
      await Session.create({
        sessionId,
        sessionToken,
        userId: user.id,
        businessProfileKey: businessId,
        createdAt: new Date(),
        expiresAt,
      });

      // Respond with session details
      return res.status(200).json({
        sessionId,
        userId: user.id,
        expiresAt: expiresAt.toISOString(),
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

exports.logout = async (req, res) => {
  res.json({});
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json({ user });
};

exports.add = async (req, res) => {
  res.json({});
};


exports.redeem = async (req, res) => {
  res.json({});
};

