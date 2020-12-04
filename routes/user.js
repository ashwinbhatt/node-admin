const {config, logger} = process.admin
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const JWT_SECRET = config.JWT_SECRET
const {checkAuthen} = require('../middlewares/middlewares')
const {createUser, readUser, updateUser, deleteUser, readAllUser, updateAUser} = require('./db_module');
const middlewares = require('../middlewares/middlewares');


const strongPassFilter = (password) => {
    return new Promise((resolve, reject) => {
        const {password_strength} = process.webConf.password;
        const password_feature = {
            "lowerCase": !password_strength.lowerCase  || /[a-z]/.test(password),
            "upperCase": !password_strength.upperCase  || /[A-Z]/.test(password),
            "numeric": !password_strength.numeric  || /[0-9]/.test(password),
            "specialChar": !password_strength.specialChar  || /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password),
            "minLength": password.length>=password_strength.minLength  
        }

        if( !password_feature.minLength){
            reject('Password should be of length '+password_strength.minLength +' at least')
        }

        if( !password_feature.lowerCase){
            reject('Password should contain lower case character')
        }

        if( !password_feature.upperCase){
            reject('Password should contain upper case character')
        }
        if( !password_feature.numeric){
            reject('Password should contain numeric value')
        }

        if( !password_feature.specialChar){
            reject('Password should contain a special character')
        }
        resolve();
    })
}


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
        logger.info(`Created user : ${username}`)
        return res.json({message: 'Created a new user', redirect: '/user/'+savedUser._id})
    }).catch(err => {
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
            logger.error(`${username} not found`)
            return res.status(401).json({error: 'Invalid username or password'})
        }
        
        bcrypt.compare(password, savedUser.password).then((doMatch) => {
            if(doMatch){
                const token = jwt.sign({_id : savedUser._id, username: savedUser.username}, JWT_SECRET)
                logger.verbose(`User Logged in : ${savedUser.username}`)
                res.cookie('token', token);
                res.json({message: 'Logged in ', redirect: config.app.baseurl+'/user/'+savedUser.username}) 
            }else{
                return res.status(401).json({error : 'Invalid username or password'})
            }
        }).catch((err) => {
            logger.error(`Error in logging in : ${err}`)
            return res.status(401).json({error : 'Invalid username or password'})            
        })
    }).catch((err)=> {
        logger.error(`Error in loggin in : ${err}`)
        res.status(401).json({error: 'Invalid username or password'})
    })
})

router.post(config.app.baseurl+'/logout', checkAuthen, (req, res) => {
    res.clearCookie('token')
    logger.verbose(`User logged out : ${res.locals.authUser.username}`)
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
        logger.verbose(`Updated user : ${savedUser.username}`)
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
        return res.status(422).json({error: 'Update privillage denied'})
    }
    readAllUser({}).then(usersData => {
        res.json({message: 'Recieved list of users.', usersData:usersData});
    })
});


router.put(config.app.baseurl+'/user/:username/update', checkAuthen, (req, res) => {
    const {authUser} = res.locals
    const {username} = req.params
    const {password} = req.body.user
    
    if(!username || !password){
        return res.status(422).json({error: 'Provide username and password'})
    }

    if(authUser.username != username){
        return res.status(422).json({error: 'You must be logged in as '+username});
    }

    strongPassFilter(password).then(()=> {
        updateAUser(username, password).then(savedUser => {
            res.json({message: 'Password changed successfully'});
        }).catch(error => {
            res.status(422).json({error: 'Cannot update the user'})
        })
    }).catch((err)=> {
        logger.error(`Error in checking password : ${err}`)
        return res.status(404).json({error: err})
    })

})

createUser(config.admin.username, config.admin.password, 'admin').then(message => {
    logger.info(`Created/Verified user : ${config.admin.username}`)
}).catch(err => {
    
})
module.exports = router