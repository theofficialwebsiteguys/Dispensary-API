const { Session } = require('../models'); 
const { Business } = require('../models'); 
const { Op } = require('sequelize');
const AppError = require('../toolbox/appErrorClass')

const authenticateRequest = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const apiKey = req.headers['x-auth-api-key'];

    if (authorizationHeader) {
      // Check if session is valid
      const session = await Session.findOne({
        where: {
          sessionId: authorizationHeader,
          expiresAt: { [Op.gt]: new Date() },
        },
      });

      if (!session) {
        throw new AppError('Unauthenticated request', 400, { field: 'authorizationHeader', issue: 'Invalid session provided for authentication' });
      }

      req.session = session; // Attach session data to the request
      req.business_id = session.businessProfileKey;
      return next();
    }

    if (apiKey) {
      const business = await Business.findOne({
        where: {
          api_key: apiKey,
        },
      });

      if (!business) {
        throw new AppError('Unauthenticated request', 400, { field: 'x-auth-api-key', issue: 'Invalid API Key provided for authentication' });
      }

      req.business_id = business.id; // Attach business data to the request
      return next();
    }

    // If neither Bearer token nor API key is provided
    throw new AppError('Unauthenticated request', 403, { issue: 'Authorization header or API key is required' });
  } catch (error) {
    next(error); // Pass the error to the centralized error handler
  }
};




const validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.body; // Assume the token is sent in the request body

    if (!token) {
      throw new AppError('Invalid request', 400, { field: 'token', issue: 'Unable to detect reset token for validation.' });
    }

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: { [Op.gt]: Date.now() }, // Ensure token is not expired
      },
    });

    if (!user) {
      throw new AppError('Invalid request', 400, { field: 'token', issue: 'Invalid or Expired Reset Token' });
    }

    // Attach user to the request for use in the controller
    req.user = user;

    next(); // Proceed to the next middleware or controller
  } catch (error) {
    next(error); // Pass the error to the centralized error handler
  }
};


module.exports = { authenticateRequest, validateResetToken };