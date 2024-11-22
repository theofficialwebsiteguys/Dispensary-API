const logger = (req, res, next) => {
    const timestamp = new Date().toISOString()
    console.log(`\x1b[36m%s\x1b[0m`,`[${timestamp}] ${req.method} ${req.url}`)  // ansi escape character to change color of the logger
    next()
  }
  
module.exports = logger