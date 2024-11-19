// API ROUTE: ./api/referrals

const Referral = require('../models/referral')


exports.getAllReferrals = async (req, res) => {
  try {
    const referrals = await Referral.findAll()
    res.json(referrals)
  } catch (error) {
    res.status(500).json({ error: `Error fetching referrals: ${error}` })
  }
}


exports.getReferralById = async (req, res) => {
  try {
    const referral = await Referral.findByPk(req.params.id)
    if (referral) {
      res.json(referral)
    } else {
      res.status(404).json({ error: 'Referral not found' })
    }
  } catch (error) {
    res.status(500).json({ error: `Error fetching referral: ${error}` })
  }
}


exports.referUser = async (req, res) => {
  try {
    console.log(req.body)
    let { referrer_id, referred_email, referred_phone } = req.body

    if (referred_email) {
        const newReferral = await Referral.create({ referrer_id, referred_email})
        res.status(201).json(newReferral)
    } else if (referred_phone) {
        const newReferral = await Referral.create({ referrer_id, referred_phone})
        res.status(201).json(newReferral)
    }

  } catch (error) {
    res.status(500).json({ error: `${error}` })
  }
}
