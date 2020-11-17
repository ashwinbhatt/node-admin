const config = process.webConf;
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const JWT_SECRET = config.JWT_SECRET
const {checkAuthen} = require('../middlewares/middlewares')
const {createUser, readUser, updateUser, deleteUser} = require('./db_module')


router.post(config.app.baseurl +"/signup", checkAuthen, (req, res) => {
    const {username, password, role} = req.body
    const {authUser} = res.locals
    if(authUser.role != 'admin'){
        return res.status(422).json({error: 'Creation privillage denied'})
    }

    if(!username || !password || !role){
        return res.status(422).json({error: 'Please add all the required fields'})
    }

    createUser(username,password, role).then(message=> {
        return res.json({message: message})
    }).catch(err => {
        console.log(err)
        return res.status(422).json({error: 'Cannot save the User'})
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
                res.json({token : token})
            }else{
                return res.status(401).json({error : 'Invalid username or password'})
            }
        }).catch((err) => {
            console.log(err);
            return res.status(401).json({error : 'Invalid username or password'})            
        })
    }).catch((err)=> {
        res.status(401).json({error: 'Cannot delete'})
    })
})

router.put(config.app.baseurl +'/update', checkAuthen, (req, res) =>{
    const {username, password, role} = req.body
    const {authUser} = res.locals
    if(authUser.role != 'admin'){
        return res.status(422).json({error: 'Update privillage denied'})
    }
    if(!username ||  !password || !role){
        return res.status(422).json({error : 'Provide username and password'})
    }
    const newUser = {
        username: username,
        password: password,
        role: role
    }
    updateUser(username, newUser).then((savedUser)=> {
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


createUser(config.admin.username, config.admin.password, 'admin').then(message => {
    console.log('Created Admin user successfully')
}).catch(err => {
    console.log('Error encountered there was not admin user found')
    console.log(err.message)
})
module.exports = router