const { PhoneNumberUtil, PhoneNumberFormat } = require('google-libphonenumber')
const AppError = require('../../toolbox/appErrorClass')
const phoneUtil = PhoneNumberUtil.getInstance()

const isValidPhoneNumber = (value, countryCode = 'US') => {
  try {
    const number = phoneUtil.parseAndKeepRawInput(value, countryCode)

    if (!phoneUtil.isValidNumber(number)) {
      throw new AppError(`Invalid entry`, 422, {field: 'phone', details: 'the country code and number provided is not a valid combination'})
    }
    return true 
  } catch (error) {
    throw new AppError('Error encountered when validating phone number')
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
      throw new AppError('Error encountered when formatting phone number')
    }
  }

module.exports = {
    isValidPhoneNumber,
    formatPhoneNumber
}
