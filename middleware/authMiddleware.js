const { Session } = require('../models'); // Import your session model
const dt = require('../toolbox/dispensaryTools');

const authenticateRequest = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      const sessionId = authorizationHeader.split(' ')[1];

      // Check if session is valid
      const session = await Session.findOne({
          where: {
            sessionId,
            expiresAt: { [Op.gt]: new Date() },
          },
        });
      
      if (session) {
        req.session = session; // Attach session data to the request
        return next();
      }

      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const apiKey = req.headers['x-auth-api-key'];
    if (apiKey) {
      const business = await Business.findOne({
        where: {
          api_key: apiKey
        }
      })
    
      if (!business) {
        res.status(403).json({message: 'API Key invalid'})
        return false
      }
    
      req.business = business
      return next();
    }

    return res.status(403).json({ error: 'Authorization required' });
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.body; // Assume the token is sent in the request body

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: { [Op.gt]: Date.now() }, // Ensure token is not expired
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to the request for use in the controller
    req.user = user;

    next(); // Proceed to the next middleware or controller
  } catch (error) {
    console.error('Reset token validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



module.exports = { authenticateRequest, validateResetToken };