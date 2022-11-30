const express = require('express');
const signupController = require('../Controller/signupController')

const router = express.Router();


router.post('/sign-up' , signupController.sendotp)
router.post('/verify-signup', signupController.verifySignup)


module.exports = router