const { PhoneNumberUtil, PhoneNumberFormat } = require('google-libphonenumber')
const phoneUtil = PhoneNumberUtil.getInstance()

const isValidPhoneNumber = (value, countryCode = 'US') => {
  try {
    const number = phoneUtil.parseAndKeepRawInput(value, countryCode)

    if (!phoneUtil.isValidNumber(number)) {
      throw new Error(`Invalid phone number for country code: ${countryCode}`)
    }
    return true 
  } catch (error) {
    throw new Error('Invalid phone number format')
  }
}

const formatPhoneNumber = (phoneNumber, countryCode = 'US') => {
    try {
      const number = phoneUtil.parseAndKeepRawInput(phoneNumber, countryCode)
      if (!phoneUtil.isValidNumber(number)) {
        throw new Error('Invalid phone number')
      }
      // Format the number into E.164 format
      return phoneUtil.format(number, PhoneNumberFormat.E164) // example: +15551234567
    } catch (error) {
      throw new Error('Failed to format phone number')
    }
  }

module.exports = {
    isValidPhoneNumber,
    formatPhoneNumber
}
