const { PhoneNumberUtil } = require('google-libphonenumber')
const AppError = require('../../toolbox/appErrorClass')
const codes = PhoneNumberUtil.getInstance().getSupportedRegions()

const isValidCountryCode = (value = 'US') => {
    try {
        const countryCode = value
        const regex = /^[A-Z]{2}$/
        
        if (!regex.test(countryCode)) {
            throw new AppError('Invalid input', 422, {field: 'country', details: 'ensure you are using a valid 2 character country code'})
        }

        if (!codes.includes(countryCode)) {
            throw new AppError('Invalid input', 422, {field: 'country', details: 'ensure you are using a valid 2 character country code'})
        }

        return true

    } catch (error) {
        throw new AppError('Error encountered checking the country code')
    }
}

module.exports = {
    isValidCountryCode
}
