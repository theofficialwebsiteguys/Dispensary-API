const bcrypt = require('bcryptjs')

const Business = require('../models/business')
const Referral = require('../models/referral')
const User = require('../models/user')



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


async function hashUserPassword(pw) {

}
  

async function incrementUserPoints(userId, amount) {
    try {
      await User.increment(
        { points: amount }, // Field and amount to increment
        { where: { id: userId } }
      )
    } catch (error) {
      console.error('Error incrementing user points:', error)
    }
}


module.exports = {
  findReferralByEmail,
  findReferralByPhone,
  hashUserPassword,
  incrementUserPoints
}
