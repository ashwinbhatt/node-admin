const config = process.webConf
const express = require('express')
const app = require('../app')
const router = express.Router()

router.get(config.app.baseurl+'/login', (req, res) => {
    res.render('login.ejs') 
});

router.get(config.app.baseurl+'/signup', (req, res) => {
    res.render('signup.ejs')
});





    






module.exports = router