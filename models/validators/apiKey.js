const crypto = require('crypto')

function generateApiKey () {
    const apiKey = crypto.randomBytes(32).toString('hex')
    console.log(apiKey)
    return apiKey
}

module.exports = {
    generateApiKey
}