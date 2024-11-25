const { PhoneNumberUtil, PhoneNumberFormat } = require('google-libphonenumber')
const AppError = require('../../toolbox/appErrorClass')
const phoneUtil = PhoneNumberUtil.getInstance()

const isValidPhoneNumber = (value, countryCode = 'US') => {
  try {
    const number = phoneUtil.parseAndKeepRawInput(value, countryCode)

    if (!phoneUtil.isValidNumber(number)) {
      throw new AppError(`Invalid entry`, 422, {field: 'phone', issue: 'the country code and number provided is not a valid combination'})
    }
    return true 
  } catch (error) {
    throw new AppError('Server error', 500, {field: 'phone', issue: 'the server encountered an error when validating the phone number input'})
  }
}

const formatPhoneNumber = (phoneNumber, countryCode = 'US') => {
    try {
      const number = phoneUtil.parseAndKeepRawInput(phoneNumber, countryCode)

      if (!phoneUtil.isValidNumber(number)) {
        throw new AppError(`Invalid entry`, 422, {field: 'phone', issue: 'the country code and number provided is not a valid combination'})
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
