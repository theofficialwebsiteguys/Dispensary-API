// API ROUTE: ./api/orders

const Order = require('../models/order');
const AppError = require('../toolbox/appErrorClass');
const userController = require('../controllers/userController')
const toolbox = require('../toolbox/dispensaryTools')
const { Op } = require('sequelize');
const User = require('../models/user');
const OrderItem = require('../models/orderItem');

exports.createOrder = async (req, res, next) => {
    try {
        let { user_id, pos_order_id, points_add, points_redeem, amount, cart } = req.body
        let pointsAdd = Number(Math.floor(points_add))
        let pointsRedeem = Number(Math.floor(points_redeem))
        const newOrder = await Order.create({ user_id, pos_order_id, points_add: pointsAdd, points_redeem: pointsRedeem, points_locked: pointsRedeem, total_amount: amount })

        const responseOrder = {
          id: newOrder.id,
          user_id: newOrder.user_id,
          pos_order_id: newOrder.pos_order_id,
          points_add: newOrder.points_add,
          points_redeem: newOrder.points_redeem,
          points_locked: newOrder.points_redeem,
          amount: newOrder.amount
        };

        const orderItems = cart.map(item => ({
          order_id: newOrder.id,
          item_id: item.id, // Convert to string to match database schema
          title: item.title,
          brand: item.brand,
          category: item.category,
          price: item.price,
          quantity: item.quantity
      }));

      // Insert items into OrderItem table
      await OrderItem.bulkCreate(orderItems);

        if (pointsRedeem && pointsRedeem > 0) {  

          await userController.redeemPoints(
            {
              body: {
                userId: user_id,
                amount: pointsRedeem
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
          
          console.log(`Redeemed ${pointsRedeem} points from user ${user_id} for order ${pos_order_id}`);
        }
    
        res.status(201).json(responseOrder);
    } catch (error) {
        res.status(500).json({ error: `${error}` })
    }
}



exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.findAll();
    
        if (!orders) {
          throw new AppError('Not Found', 404, { field: 'order', issue: 'Error fetching orders' });
        }
    
        res.json(orders)
      } catch (error) {
        next(error)
      }
}


exports.getOrderByUserId = async (req, res, next) => {
  try {
    const userId = req.query.user_id;

    const orders = await Order.findAll({
      where: {
        user_id: userId
      }
    });

    if (!orders) {
      throw new AppError('Not Found', 404, { field: 'order', issue: 'Error fetching orders' });
    }

    res.json(await toolbox.checkUserOrders(userId))
  } catch (error) {
    next(error)
  }
}

exports.getOrdersByDateRange = async (req, res, next) => {
  try {
      let { startDate, endDate } = req.query;

      let dateFilter = {}; // Default: No filter (fetch all orders)

      // Apply date filtering if both dates are provided
      if (startDate && endDate) {
          dateFilter = {
              createdAt: {
                  [Op.between]: [new Date(startDate + "T00:00:00.000Z"), new Date(endDate + "T23:59:59.999Z")]
              }
          };
      }

      const orders = await Order.findAll({
          where: dateFilter,
          include: [
              {
                  model: User,
                  attributes: ['id', 'fname', 'lname', 'phone', 'email']
              }
          ],
          order: [['createdAt', 'DESC']]
      });

      res.json(orders);
  } catch (error) {
      next(error);
  }
};