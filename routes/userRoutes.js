// ./api/users

const express = require('express');
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', userController.getAllUsers)
router.get('/id/:id', userController.getUserById)
router.post('/register', userController.registerUser)

module.exports = router;
