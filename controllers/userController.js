// API ROUTE: ./api/users
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Referral = require('../models/referral')
const sequelize = require('../db')

// HELPER METHODS //
async function findReferralByEmail(email) {
  try {
    const referral = await Referral.findOne({
      where: {
        referred_email: email,
        referral_converted: false
      },
    })

    if (referral) {
      //console.log('Referral found:', referral)
      return referral
    } else {
      //console.log('No referral found with that email')
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
      console.log('Referral found:', referral)
      return referral
    } else {
      console.log('No referral found with that phone')
      return null
    }
  } catch (error) {
    console.error('Error finding referral by phone:', error)
    throw error
  }
}

async function incrementUserPoints(userId, amount) {
  try {
    await User.increment(
      { points: amount }, // Field and amount to increment
      { where: { id: userId } }
    )
    console.log(`User with ID ${userId} points incremented by ${amount}`)
  } catch (error) {
    console.error('Error incrementing user points:', error)
  }
}


// ROUTE DEFINITIONS //
// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: `Error fetching users: ${error}` })
  }
}

// Get a single user by ID
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

// Create a new user
exports.registerUser = async (req, res) => {
  try {
    console.log(req.body)
    let { fname, lname, email, dob, phone, password, points, business_id } = req.body
    let referred_by = null
    let referral_obj = null

    await findReferralByEmail(email)
      .then(referral => {
        if(referral) {
          referral_obj = referral
          referred_by = referral.dataValues.referrer_id
        }
      })
  
    await findReferralByPhone(phone)
      .then(referral => {
        if(referral) {
          referral_obj = referral
          referred_by = referral.dataValues.referrer_id
        }
      })
  
    const newUser = await User.create({ fname, lname, email, dob, phone, password, points, business_id, referred_by })

    if (referral_obj) {
      incrementUserPoints(newUser.dataValues.id, 200)
      incrementUserPoints(referred_by, 200)
      await referral_obj.update(
        {referral_converted: true}, 
        {where: {id: referral_obj.dataValues.id}}
      )
    }

    res.status(201).json(newUser)
  } catch (error) {
    res.status(500).json({ error: `${error}` })
  }
}

// Delete an existing user
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