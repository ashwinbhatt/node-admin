const config = process.webConf;
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const JWT_SECRET = config.JWT_SECRET
const {checkAuthen} = require('../middlewares/middlewares')
const {createUser, readUser, updateUser, deleteUser, readAllUser} = require('./db_module');
const middlewares = require('../middlewares/middlewares');


router.post(config.app.baseurl +"/signup", checkAuthen, (req, res) => {
    const {username, password, role} = req.body
    const {authUser} = res.locals
    if(authUser.role != 'admin'){
        return res.status(422).json({error: 'Creation privillage denied'})
    }

    if(!username || !password || !role){
        return res.status(422).json({error: 'Please add all the required fields'})
    }

    createUser(username,password, role).then(savedUser=> {
        return res.json({message: 'Created a new user', redirect: '/user/'+savedUser._id})
    }).catch(err => {   
        console.log(err)
        return res.status(422).json({error: err})
    })
});

router.post(config.app.baseurl +'/login' ,(req, res) => {
    const {username, password} = req.body
    if(!username || !password){
        return res.status(422).json({error : 'Provide username and password'})
    }

    readUser({username: username}).then(savedUser=> {
        if(!savedUser){
            return res.status(401).json({error: 'Invalid username or password'})
        }
        
        bcrypt.compare(password, savedUser.password).then((doMatch) => {
            if(doMatch){
                const token = jwt.sign({_id : savedUser._id, username: savedUser.username}, JWT_SECRET)
                console.log('User logged in => '+savedUser.username)
                res.cookie('token', token);
                res.json({message: 'Logged in ', redirect: config.app.baseurl+'/user/'+savedUser.username}) 
            }else{
                return res.status(401).json({error : 'Invalid username or password'})
            }
        }).catch((err) => {
            console.log(err);
            return res.status(401).json({error : 'Invalid username or password'})            
        })
    }).catch((err)=> {
        res.status(401).json({error: 'User does not exits'})
    })
})

router.post(config.app.baseurl+'/logout', checkAuthen, (req, res) => {
    res.clearCookie('token')
    console.log('User logged out => '+res.locals.authUser.username)
    res.json({message: 'User logged out', redirect: config.app.baseurl})
})


router.put(config.app.baseurl +'/update', checkAuthen, (req, res) =>{
    const user = req.body.user
    const {authUser} = res.locals
    if(authUser.role != 'admin'){
        return res.status(422).json({error: 'Update privillage denied'})
    }
    if(!user || !user.username){
        return res.status(422).json({error : 'Invalid format'})
    }
    
    updateUser(user.username, user, false).then((savedUser)=> {
        res.json({message: 'Updated '+savedUser.username})
        return
    }).catch(err=> {
        res.status(401).json({error: 'Cannot update'})
        return
    })
})

router.delete(config.app.baseurl +'/delete', checkAuthen, (req, res) => {
    const {username} = req.body
    const {authUser} = res.locals
    if(!username){
        return res.status(422).json({error: 'Provide username'})
    }
    if(username == config.admin.username || authUser.role != 'admin'){
        return res.status(422).json({error: 'Delete privillage denied'})
    }
    deleteUser(username).then(()=> {
        return res.json({message: 'User deleted'})
    }).catch(err=> {
        return res.status(422).json({error: 'Cannot delete user'})
    })
})


router.get(config.app.baseurl + '/users',checkAuthen ,(req, res) => {
    const {authUser} = res.locals
    if(authUser.role != 'admin'){
        console.log('cannot send data')
        return res.status(422).json({error: 'Update privillage denied'})
    }
    readAllUser({}).then(usersData => {
        console.log('data is sent')
        res.json({message: 'Recieved list of users', usersData:usersData});
    })
});




createUser(config.admin.username, config.admin.password, 'admin').then(message => {
    console.log('Created'+ config.admin.username +'user successfully')
}).catch(err => {
    // console.log(err)
})
module.exports = router