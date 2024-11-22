const bcrypt = require('bcryptjs')
const { Op } = require('sequelize');
const nodemailer = require('nodemailer')

const Business = require('../models/business')
const Referral = require('../models/referral')
const User = require('../models/user')
const Session = require('../models/session')

const AppError = require('./appErrorClass')


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


async function incrementUserPoints(userId, amount, business_id) {
  try {
    let amountNumber = Number(amount)
    let points = Math.floor(amountNumber)
    await User.increment(
      { points: points },
      { where: { id: userId, business_id } }
    )
    return points
  } catch (error) {
    console.error('Error incrementing user points:', error)
    return -1
  }
}


async function decrementUserPoints(userId, amount, business_id) {
  try {
    let amountNumber = Number(amount)
    let points = Math.floor(amountNumber)
    await User.decrement(
      { points: points }, // Field and amount to increment
      { where: { id: userId, business_id } }
    )
    return points
  } catch (error) {
    console.error('Error decrementing user points:', error)
    return -1
  }
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



module.exports = {
  findReferralByEmail,
  findReferralByPhone,
  hashUserPassword,
  decrementUserPoints,
  incrementUserPoints,
  sendEmail,
}




// async function authenticateApiKey(req, res, next) {
//   const key = req.headers["x-auth-api-key"]

//   try {
//     if (!key) {
//       throw new AppError('Unauthenticated request', 400, { field: 'x-auth-api-key', issue: 'Unable to detect API Key for authentication' })
//     }

//     const business = await Business.findOne({
//       where: {
//         api_key: key
//       }
//     })

//     if (!business) {
//       throw new AppError('Unauthenticated request', 400, { field: 'x-auth-api-key', issue: 'Invalid API Key provided for authentication' })
//     }

//     req.business = business
//     next()

//   } catch (error) {
//     next(error)
//   }
// }