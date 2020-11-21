const config = process.webConf
const express = require('express')
const app = require('../app')
const router = express.Router()
const { readUser } = require('./db_module')

router.get(config.app.baseurl + '/login', (req, res) => {
    res.render('login.ejs', {'url_base': config.app.baseurl})
});

router.get(config.app.baseurl + '/signup', (req, res) => {
    res.render('signup.ejs')
});

router.get(config.app.baseurl + '/update', (req, res) => {
    res.render('update.ejs')
})

router.get(config.app.baseurl + '/delete', (req, res) => {
    res.render('delete.ejs')
})

router.get(config.app.baseurl + '/user/:username', (req, res) => {

    readUser({ username: req.params.username }).then(userData => {
        console.log(userData);
    }).catch(err => {
        console.log(err)
    })
    res.render('userPage.ejs')
})














module.exports = router