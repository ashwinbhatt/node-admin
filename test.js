const config = process.webConf;
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()

const {checkAuthen} = require('./middlewares/middlewares')


router.get('/secure', checkAuthen, (req, res)=> {
    var time = new Date(Date.now())
    // console.log(res.locals.authUser)
    const {authUser} = res.locals 
    // console.log(authUser)
    var diff = time.getTime() - authUser.creation_stamp.getTime() 
    res.json({message:'time diff in milli sec '+diff})
})


 


module.exports = router