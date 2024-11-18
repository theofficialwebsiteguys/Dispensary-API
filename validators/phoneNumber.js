const { PhoneNumberUtil, PhoneNumberFormat } = require('google-libphonenumber')
const phoneUtil = PhoneNumberUtil.getInstance()

const isValidPhoneNumber = (value, countryCode = 'US') => {
  try {
    // Parse the phone number using the provided country code
    const number = phoneUtil.parseAndKeepRawInput(value, countryCode)

    // Check if the parsed phone number is valid
    if (!phoneUtil.isValidNumber(number)) {
      throw new Error(`Invalid phone number for country code: ${countryCode}`)
    }

    return true // Valid phone number
  } catch (error) {
    throw new Error('Invalid phone number format')
  }
}

const formatPhoneNumber = (phoneNumber, countryCode = 'US') => {
    console.log(phoneNumber, countryCode)
    try {
      const number = phoneUtil.parseAndKeepRawInput(phoneNumber, countryCode)
      if (!phoneUtil.isValidNumber(number)) {
        throw new Error('Invalid phone number')
      }
      // Format the number into E.164 format
      return phoneUtil.format(number, PhoneNumberFormat.E164) // Example: +15551234567
    } catch (error) {
      console.log(error)
      throw new Error('Failed to format phone number')
    }
  }

module.exports = {
    isValidPhoneNumber,
    formatPhoneNumber
}