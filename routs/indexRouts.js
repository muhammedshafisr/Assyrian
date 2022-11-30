const express = require('express');
const router = express.Router();
const indexController = require('../Controller/indexController')



router.get('/home', (req, res) => {
    res.redirect('/')
})









module.exports = router ;