// API ROUTE: ./api/orders

const Order = require('../models/order');
const AppError = require('../toolbox/appErrorClass');

exports.createOrder = async (req, res, next) => {
    try {
        let { user_id, pos_order_id, points_add, points_redeem } = req.body
        console.log(points_add)
        let pointsAdd = Number(Math.floor(points_add))
        console.log(pointsAdd)
        let pointsRedeem = Number(Math.floor(points_redeem))
        const newOrder = await Order.create({ user_id, pos_order_id, points_add: pointsAdd, points_redeem: pointsRedeem })

        const responseOrder = {
          id: newOrder.id,
          user_id: newOrder.user_id,
          pos_order_id: newOrder.pos_order_id,
          points_add: newOrder.points_add,
          points_redeem: newOrder.points_redeem
        };
    
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
    const orders = await Order.findAll({
      where: {
        user_id: req.body.user_id
      }
    });

    if (!orders) {
      throw new AppError('Not Found', 404, { field: 'order', issue: 'Error fetching orders' });
    }

    res.json(orders)
  } catch (error) {
    next(error)
  }
}