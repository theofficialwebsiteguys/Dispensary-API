// API ROUTE: ./api/users
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Referral = require('../models/referral')
const sequelize = require('../db')
const dt = require('../toolbox/dispensaryTools')


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


exports.registerUser = async (req, res) => {
  console.log(req.body)
  try {
    let { fname, lname, email, dob, phone, password, points, business_id } = req.body
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

    const newUser = await User.create({ fname, lname, email, dob, phone, password: pw, points, business_id, referred_by })

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
    res.status(200).json({userId: `${userId}`, points_added: `${result}` })
  }
  catch (error) {
    res.status(500).json({ error: `Error adding points: ${error}` })
  }
}
