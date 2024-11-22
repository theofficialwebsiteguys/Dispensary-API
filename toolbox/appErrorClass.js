class AppError extends Error {
    constructor(message, statusCode, details) {
      super(message)
      this.status = statusCode
      this.details = details
      Error.captureStackTrace(this, this.constructor); // Captures the stack trace
    }
  }

module.exports = AppError