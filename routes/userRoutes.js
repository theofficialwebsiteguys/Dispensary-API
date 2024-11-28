// ./api/users

const express = require('express')
const userController = require('../controllers/userController')
const { authenticateRequest, validateResetToken } = require('../middleware/authMiddleware');

const router = express.Router()

router.post('/login', userController.login)
router.post('/register', userController.registerUser)
router.post('/forgot-password', userController.sendResetPassword)

router.post('/reset-password', validateResetToken, userController.resetPassword)

router.use(authenticateRequest);

router.get('/validate-session', (req, res) => {
    res.status(200).json({ valid: true });
});

router.get('/', userController.getAllUsers)
router.get('/id/:id', userController.getUserById)
router.get('/email', userController.getUserByEmail)
router.get('/phone', userController.getUserByPhone)
router.delete('/delete/:id', userController.deleteUser)
router.put('/add-points', userController.addPoints)
router.put('/redeem-points', userController.redeemPoints)
router.post('/logout', userController.logout)
router.put('/toggle-notifications', userController.toggleNotifications)
router.put('/update', userController.updateUser)


module.exports = router
