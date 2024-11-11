// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/user', authMiddleware, userController.getUser);
router.put('/add', userController.add);
router.put('/redeem', userController.redeem);

module.exports = router;
