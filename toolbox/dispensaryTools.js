require('dotenv').config()

const bcrypt = require('bcryptjs')
const { Op } = require('sequelize');
const nodemailer = require('nodemailer')

const Business = require('../models/business')
const Referral = require('../models/referral')
const User = require('../models/user')
const Session = require('../models/session')
const Order = require('../models/order')

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


function generateBasicAuthToken(username, password) {
  const credentials = btoa(`${username}:${password}`); 
  return `${credentials}`;
}


async function getAlleavesApiToken() {
    const user = process.env.ALLEAVES_USER
    const password = process.env.ALLEAVES_PASS
    const basicAuth = generateBasicAuthToken(user, password)
    let newToken = ""

    try {
      let api_url = `https://app.alleaves.com/api/auth`
      await fetch(api_url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          Accept: 'application/json; charset=utf-8'
        }
      })
        .then((response) => {return response.json() })
        .then((data) => {
          newToken = data.token
        })

      return newToken

    } catch (error) {
      console.error('error creating alleaves api token', error)
    }


}


async function checkAlleavesOrder(pos_order_id) {
  let order_details = []
  let alleavesToken = await getAlleavesApiToken()

  try {
    let api_url = `https://app.alleaves.com/api/order/${pos_order_id}`
    await fetch(api_url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${alleavesToken}`,
        Accept: 'application/json; charset=utf-8'
      }
    })
      .then((response) => { return response.json() })
      .then((data) => {
        if (!data.error) {
          let order_json = {}
          let items_json = {}

          order_json["id_order"] = data.id_order
          order_json["total"] = data.total
          order_json["pickup_date"] = data.pickup_date
          order_json["pickup_time"] = data.pickup_time
          order_json["complete"] = data.complete
          order_json["status"] = data.status
          order_json["paid_in_full"] = data.paid_in_full

          data.items.forEach((item) => {
            if (!items_json[`${item.id_inventory_item}`]) {
              items_json[`${item.id_inventory_item}`] = 1
            } else {
              items_json[`${item.id_inventory_item}`] += 1
            }
          })

          order_json["items"] = items_json
          order_details.push(order_json)
        }
      })

    return order_details

  } catch (error) {
    console.log('Error retrieving data: ', error)
  }
}


async function checkUserOrders(userId) {
  try {
    let orders = []
    let orders_details = []
    const response = await Order.findAll({
      where: {
        user_id: userId
      }
    })

    orders = response
    if (orders.length > 0) {
      for (const order of orders) {
        // To make this extensible for future applications/changing a POS,
        // Can add some sort of check here for which POS the order belongs to, and run corresponding function
        // if order.user.business.pos is typeof(AlleavesOrder)...
        // elif order.user.business.pos is typeof(MagicalFruitOrder)...

        const orderInfo = await checkAlleavesOrder(order['dataValues']['pos_order_id'])

        if (orderInfo.length > 0) {
          orders_details.push(...orderInfo)
          if (orderInfo.complete = true) {
            await order.update({
              complete: true
            })
          }
        }
      }
    }

    return orders_details

  } catch (error) {
    console.error('Error getting orders: ', error)
  }
}

module.exports = {
  findReferralByEmail,
  findReferralByPhone,
  hashUserPassword,
  decrementUserPoints,
  incrementUserPoints,
  sendEmail,
  checkUserOrders,
  getAlleavesApiToken
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