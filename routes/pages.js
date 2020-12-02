const config = process.webConf
const express = require('express')
const router = express.Router()
const { readUser, deleteUser } = require('./db_module')
const {checkAuthen} = require('../middlewares/middlewares')


router.get(config.app.baseurl, (req, res) => {
    res.redirect(config.app.baseurl+'/login')
});


router.get(config.app.baseurl + '/login', (req, res) => {
    res.render('login.ejs', {'url_base': config.app.baseurl})
});

router.get(config.app.baseurl + '/signup', checkAuthen,(req, res) => {
    const {authUser} = res.locals
    if(res.locals.authUser.role != 'admin'){
        return res.status(401).json({error: 'You are not authorised to add a user !'})
    }
    res.render('signup.ejs', {'url_base': config.app.baseurl, 'logged_user': authUser.username})  
});

router.get(config.app.baseurl + '/update', checkAuthen,(req, res) => {
    const {authUser} = res.locals
    if(authUser.role != 'admin' ){
        return res.status(422).json({error: 'Update privillage denied'})
    }
    res.render('update.ejs', {'url_base': config.app.baseurl, 'logged_user': authUser.username})
})

router.get(config.app.baseurl + '/delete', checkAuthen,(req, res) => {
    const {authUser} = res.locals
    if(res.locals.authUser.role != 'admin'){
        return res.status(401).json({error: 'You are not authorised to delete a user !'})
    }
    res.render('delete.ejs', {'url_base': config.app.baseurl, 'logged_user': authUser.username})
})

router.get(config.app.baseurl + '/user/:username', checkAuthen,(req, res) => {
    const {authUser} = res.locals
    if(req.params.username != authUser.username){
        res.redirect(config.app.baseurl+'/login')
    }else{
        var signUrl=null, updateUser=null, deleteUser= null, updateNoAdmin=req.originalUrl+'/update'; 
        if(authUser.role=='admin'){
            signUrl= config.app.baseurl+'/signup'
            updateUser=config.app.baseurl+'/update'
            deleteUser=config.app.baseurl+'/delete'
        }
        res.render('userPage', {'url_base': config.app.baseurl, 
                                'userData': authUser, 
                                'signUrl': signUrl, 
                                'updateUser': updateUser, 
                                'deleteUser': deleteUser,
                                'updateNoAdmin': updateNoAdmin, 
                                'logged_user': authUser.username
                            })
    }
})

router.get(config.app.baseurl+'/user/:username/update', checkAuthen,(req, res) => {
    const {authUser} = res.locals
    const {username} = req.params
    
    if(!username){
        return res.status(422).json({error: 'Provide username and password'})
    }

    if(authUser.username != username){
        return res.status(422).json({error: 'You must be logged in as '+username});
    }

    res.render('userUpdate', {  'success_redirect': config.app.baseurl+'/user'+username, 
                                'url_base': config.app.baseurl, 
                                'logged_user': authUser.username
                            })
});

module.exports = router