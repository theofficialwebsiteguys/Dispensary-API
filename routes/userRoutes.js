// ./api/users

const express = require('express')
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', userController.getAllUsers)
router.get('/id/:id', userController.getUserById)
router.get('/email', userController.getUserByEmail)
router.get('/phone', userController.getUserByPhone)
router.post('/register', userController.registerUser)
router.delete('/delete/:id', userController.deleteUser)
router.put('/add-points', userController.addPoints)
router.put('/redeem-points', userController.redeemPoints)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

module.exports = router
