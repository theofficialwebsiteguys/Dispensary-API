const isoAlpha2Codes = [
    'AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ',
    'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV',
    'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV',
    'CW', 'CX', 'CY', 'CZ', 'DA', 'DE', 'DZ', 'EG', 'EH', 'FI', 'FJ', 'FM', 'FO', 'FR', 'GA', 'GE', 'GH',
    'GI', 'GR', 'GW', 'GY', 'HK', 'HN', 'HT', 'HU', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IL', 'IM', 'IT', 'JM',
    'JP', 'JE', 'JO', 'KH', 'KI', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LS', 'LT', 'LU', 'LV',
    'LY', 'MA', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MU', 'MV',
    'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA',
    'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RU', 'RS',
    'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST',
    'SV', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV',
    'TZ', 'UA', 'UG', 'UK', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE',
    'ZA', 'ZM', 'ZW'
];

const isValidCountryCode = (value = 'US') => {
    try {
        const countryCode = value

        if (!isoAlpha2Codes.includes(countryCode)) {
            throw new Error('Invalid Country Code');
        }

        return true

    } catch (error) {
        throw new Error('Invalid phone number format')
    }
}

module.exports = {
    isValidCountryCode
}
