// controllers/userController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { validationResult, body } = require('express-validator');
const { User, Session, Business } = require('../models');
const { Op } = require('sequelize');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET
const SESSION_EXPIRY_HOURS = 168; // e.g., 7 days
// API ROUTE: ./api/users
//const User = require('../models/user')
const dt = require('../toolbox/dispensaryTools')


exports.login = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
  body('businessId').notEmpty().withMessage('businessId is required'),
  body('businessName').notEmpty().withMessage('businessName is required'),

  async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, businessId, businessName } = req.body;

    try {
      // Find user by email
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        return res.status(401).json({ error: 'Incorrect email or password' });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Incorrect email or password here' });
      }

      // Verify user's business profile
      const businessProfile = await Business.findOne({
        where: { id: businessId, name: businessName },
      });
      if (!businessProfile) {
        return res.status(404).json({ error: 'No matching business profile' });
      }

      // Check for an existing session
      const existingSession = await Session.findOne({
        where: {
          userId: user.id,
          businessProfileKey: businessId,
          expiresAt: { [Op.gt]: new Date() }, // Only find sessions that haven't expired
        },
      });

      if (existingSession) {
        // Use the existing session
        return res.status(200).json({
          sessionId: existingSession.sessionId,
          userId: user.id,
          expiresAt: existingSession.expiresAt.toISOString(),
        });
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
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: `Error fetching users: ${error}` })
  }
}


exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ error: `Error fetching user: ${error}` })
  }
}


exports.getUserByEmail = async (req, res) => {
  const { email } = req.body
  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    })
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ error: `Error fetching user: ${error}` })
  }
}


exports.registerUser = async (req, res) => {
  console.log(req.body)
  try {
    let { fname, lname, email, dob, country, phone, password, points, business_id } = req.body
    let referred_by = null
    let referral_obj = null
    let pw = await dt.hashUserPassword(password)

    await dt.findReferralByEmail(email)
      .then(referral => {
        if (referral) {
          referral_obj = referral
          referred_by = referral.dataValues.referrer_id
        }
      })

    await dt.findReferralByPhone(phone)
      .then(referral => {
        if (referral) {
          referral_obj = referral
          referred_by = referral.dataValues.referrer_id
        }
      })

    const newUser = await User.create({ fname, lname, email, dob, phone, password: pw, points, business_id, referred_by }, { validate: true, countryCode: country })

    // handle the flow for updates if there is a referral
    if (referral_obj) {
      await dt.incrementUserPoints(newUser.dataValues.id, 200)
      await dt.incrementUserPoints(referred_by, 200)
      await referral_obj.update(
        { referral_converted: true },
        { where: { id: referral_obj.dataValues.id } }
      )
    }

    res.status(201).json(newUser)
  } catch (error) {
    res.status(500).json({ error: `${error}` })
  }
}


exports.deleteUser = async (req, res) => {
  const userId = req.params.id

  try {
    const user = await User.findByPk(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await user.destroy()
    res.status(200).json({ message: `User with ID ${userId} deleted successfully` })

  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ message: 'Error deleting user' })
  }
}


exports.addPoints = async (req, res) => {
  let { userId, amount } = req.body
  try {
    let result = await dt.incrementUserPoints(userId, amount)
    res.status(200).json({ userId: `${userId}`, points_added: `${result}` })
  }
  catch (error) {
    res.status(500).json({ error: `Error adding points: ${error}` })
  }
}


exports.redeemPoints = async (req, res) => {
  let { userId, amount } = req.body
  try {
    let result = await dt.decrementUserPoints(userId, amount)
    res.status(200).json({ userId: `${userId}`, points_redeemed: `${result}` })
  }
  catch (error) {
    res.status(500).json({ error: `Error redeeming points: ${error}` })
  }
}
