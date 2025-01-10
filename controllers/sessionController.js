// API ROUTE: ./api/businesses
const Session = require('../models/session')

exports.getAllSessions = async (req, res, next) => {
    try {
      const sessions = await Session.findAll();
  
      if(!sessions){
        throw new AppError('Not Found', 404, { field: 'sessions', issue: 'Error fetching sessions' });
      }
  
      res.json(sessions);
    } catch (error) {
      next(error)
    }
  };