const bcrypt = require('bcryptjs')
const { Op } = require('sequelize');
const nodemailer = require('nodemailer')

const Business = require('../models/business')
const Referral = require('../models/referral')
const User = require('../models/user')
const Session = require('../models/session')


async function findReferralByEmail(email) {
  try {
    const referral = await Referral.findOne({
      where: {
        referred_email: email,
        referral_converted: false
      },
    })

    if (referral) {
      return referral
    } else {
      return null
    }
  } catch (error) {
    console.error('Error finding referral by email:', error)
    throw error
  }
}


async function findReferralByPhone(phone) {
  try {
    const referral = await Referral.findOne({
      where: {
        referred_phone: phone,
        referral_converted: false
      },
    })

    if (referral) {
      return referral
    } else {
      return null
    }
  } catch (error) {
    console.error('Error finding referral by phone:', error)
    throw error
  }
}


async function hashUserPassword(pw) {
  try {
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(pw, saltRounds)

    return hashedPassword
  } catch (error) {
    console.error('Error hashing password:', error)
  }
}


async function incrementUserPoints(userId, amount) {
  try {
    let amountNumber = Number(amount)
    let points = Math.floor(amountNumber)
    await User.increment(
      { points: points },
      { where: { id: userId } }
    )
    return points
  } catch (error) {
    console.error('Error incrementing user points:', error)
    return -1
  }
}


async function decrementUserPoints(userId, amount) {
  try {
    let amountNumber = Number(amount)
    let points = Math.floor(amountNumber)
    await User.decrement(
      { points: points }, // Field and amount to increment
      { where: { id: userId } }
    )
    return points
  } catch (error) {
    console.error('Error decrementing user points:', error)
    return -1
  }
}


async function checkUserAuthentication(sessionId) {
  await Session.findOne({
    where: {
      sessionId,
      expiresAt: { [Op.gt]: new Date() },
    },
  });
}


async function sendEmail(email) {
  let { to, subject, text, html } = email;
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Or your email service provider
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password
      },
    });

    await transporter.sendMail({
      from: '"My App Support" <theofficialwebsiteguys@gmail.com>', // Sender address
      to, // List of recipients
      subject, // Subject line
      text, // Plain text body
      html, // HTML body
    });
  } catch (error) {
    console.error('Error Sending Email:', error)
    return -1
  }
}


async function validateResetToken(token) {
  if (!token) {
    throw new Error('Token is required');
  }

  const user = await User.findOne({
    where: {
      reset_token: token,
      reset_token_expiry: { [Op.gt]: Date.now() }, // Ensure token is not expired
    },
  });

  if (!user) {
    throw new Error('Invalid or expired token');
  }

  return user; // Return the user if the token is valid
}


async function authenticateApiKey(req, res, next) {
  const key = req.headers["x-auth-api-key"]

  if (!key) {
    res.status(400).json({message: 'API Key not detected'})
    return false
  }

  const business = await Business.findOne({
    where: {
      api_key: key
    }
  })

  if (!business) {
    res.status(403).json({message: 'API Key invalid'})
    return false
  }

  req.business = business
  next()
}


module.exports = {
  findReferralByEmail,
  findReferralByPhone,
  hashUserPassword,
  decrementUserPoints,
  incrementUserPoints,
  checkUserAuthentication,
  sendEmail,
  validateResetToken,
  authenticateApiKey
}
