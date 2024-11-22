// ./api/users

const express = require('express')
const userController = require('../controllers/userController')
const { authenticateApiKey } = require('../toolbox/dispensaryTools')

const router = express.Router()

router.get('/', authenticateApiKey, userController.getAllUsers)
router.get('/id/:id', authenticateApiKey, userController.getUserById)
router.get('/email', userController.getUserByEmail)
router.get('/phone', userController.getUserByPhone)
router.post('/register', userController.registerUser)
router.delete('/delete/:id', userController.deleteUser)
router.put('/add-points', userController.addPoints)
router.put('/redeem-points', userController.redeemPoints)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.post('/forgot-password', userController.sendResetPassword)
router.post('/reset-password', userController.resetPassword)
//router.put('/toggle-notifications', userController.toggleNotifications)

module.exports = router
