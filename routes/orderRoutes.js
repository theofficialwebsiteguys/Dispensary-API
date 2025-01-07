// ./api/orders

const express = require('express');
const orderController = require('../controllers/orderController')
const { authenticateRequest } = require('../middleware/authMiddleware');

const router = express.Router()

//router.use(authenticateRequest);

router.get('/', orderController.getAllOrders)
// router.get('/id/:id', orderController.getOrderById)
// router.get('/pos-order', orderController.getOrderByPosOrderId)
router.get('/user', orderController.getOrderByUserId)
router.post('/create', orderController.createOrder)

module.exports = router;
