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

const userController = require('../controllers/userController')


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

      // Parallel processing of checkAlleavesOrder to speed things up
      const orderChecks = orders.map(async (order) => {

        const orderInfo = await checkAlleavesOrder(order['dataValues']['pos_order_id']);



        if (orderInfo.length > 0) {
          orders_details.push(...orderInfo);
        
          if (orderInfo[0].complete === true) {
            let orderDetails = order.get()
            // Check if the order is already marked complete and points haven't been processed
            if (!orderDetails.points_awarded) {

              const user = await User.findByPk(orderDetails.user_id);

              if (user) {
                // Handle adding or redeeming points
                if (orderDetails.points_add && orderDetails.points_add > 0) {
                  // Call function to add points
                  await userController.addPoints(
                    {
                      body: {
                        userId: user.get().id,
                        amount: orderDetails.points_add
                      }
                    }, 
                    {
                      status: (code) => ({
                        json: (data) => console.log(`Status: ${code}`, data)
                      })
                    }, 
                    (error) => {
                      if (error) console.error('Error adding points:', error);
                    }
                  );
                  console.log(`Added ${orderDetails.points_add} points to user ${user.get().id} for order ${orderDetails.id}`);
                  
                } else if (orderDetails.points_redeem && orderDetails.points_redeem > 0) {
                  // Call function to redeem points
                  console.log(user.get());
                
                  await userController.redeemPoints(
                    {
                      body: {
                        userId: user.get().id,
                        amount: orderDetails.points_redeem
                      }
                    }, 
                    {
                      status: (code) => ({
                        json: (data) => console.log(`Status: ${code}`, data)
                      })
                    }, 
                    (error) => {
                      if (error) console.error('Error redeeming points:', error);
                    }
                  );
                  
                  console.log(`Redeemed ${orderDetails.points_redeem} points from user ${user.get().id} for order ${orderDetails.id}`);
                }
                
              }
        
              // Update order to mark as complete and points as awarded
              await order.update({ complete: true, points_awarded: true });
            } else {
              // Just ensure the order is marked complete if not already
              await order.update({ complete: true });
              console.log(`Order ${order.id} is already complete, and points have been processed.`);
            }
          }
        }
        
        

      });

      await Promise.all(orderChecks);
    }

    return orders_details;

  } catch (error) {
    console.error('Error getting orders: ', error)
  }
}


/**
 * Retrieves a user's push token.
 * Used internally by controllers.
 * 
 * @param {number} userId - The ID of the user.
 * @returns {Promise<string>} - The push token of the user.
 * @throws {AppError} - Throws error if user or token is not found.
 */
async function getUserPushToken(userId) {
  try {
    const user = await User.findByPk(userId, { attributes: ['pushToken'] });

    if (!user) {
      throw new AppError(`User with ID ${userId} not found`, 404, { field: 'pushToken', issue: 'No user found' });
    }

    if (!user.pushToken) {
      throw new AppError(`Push token not found for user ID ${userId}`, 404, { field: 'pushToken', issue: 'Push token missing' });
    }

    return user.pushToken;
  } catch (error) {
    console.error('Error retrieving push token:', error);
    throw error;
  }
}

/**
 * Updates a user's push token.
 * 
 * @param {string} email - The email of the user.
 * @param {string} token - The new push token.
 * @returns {Promise<string>} - A success message.
 * @throws {AppError} - Throws error if the user is not found.
 */
async function updateUserPushToken(email, token) {
  try {
    if (!email || !token) {
      throw new AppError('Email and token are required.', 400, { field: 'updatePushToken', issue: 'Missing required fields' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new AppError(`User with email ${email} not found.`, 404, { field: 'pushToken', issue: 'User not found' });
    }

    if (user.pushToken !== token) {
      user.pushToken = token; // Update the push token
      await user.save();
      return 'Push token updated successfully.';
    }

    return 'Push token is already up-to-date.';
  } catch (error) {
    console.error('Error updating push token:', error);
    throw error;
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
  getAlleavesApiToken,
  getUserPushToken,
  updateUserPushToken
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