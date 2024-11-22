const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500
    const message = err.message || 'Internal Server Error'
    const details = err.details || ''
  
    res.status(statusCode).json({
      success: false,
      error: message,
      status: statusCode,
      details: details
    })
}

module.exports = errorHandler