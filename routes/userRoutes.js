// ./api/users

const express = require('express')
const userController = require('../controllers/userController')
const { authenticateRequest, validateResetToken } = require('../middleware/authMiddleware');
const toolbox = require('../toolbox/dispensaryTools')

const router = express.Router()

router.post('/login', userController.login)
router.post('/register', userController.registerUser)
router.post('/forgot-password', userController.sendResetPassword)

router.get('/redirect', userController.handleResetPasswordRedirect)
router.post('/reset-password', validateResetToken, userController.resetPassword)
router.get('/validate-reset-token', validateResetToken, (req, res) => {
    res.status(200).json({ success: true, message: 'Reset token is valid.' });
});
  
router.use(authenticateRequest);

router.get('/validate-session', async (req, res) => {
    console.log(req.user_id)
    if (req.user_id !== undefined) {
        let x = await toolbox.checkUserOrders(req.user_id);
        console.log("FINAL RESPONSE", x)
    }
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
router.post('/update-push-token', userController.updateUserPushToken)
router.post('/push-token', userController.getUserPushToken)
router.put('/user-membership/upgrade', userController.upgradeUserMembership)
router.put('/user-membership/downgrade', userController.downgradeUserMembership)


module.exports = router
