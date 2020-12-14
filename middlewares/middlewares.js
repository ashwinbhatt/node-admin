const {config, logger, baseUrl} = global.APP_VARIABLES
const jwt = require('jsonwebtoken')
const {readUser} = require('../routes/db_module')
const {JWT_SECRET} = config.token

function checkAuthen(req, res, next) {
    if(!req.cookies || !req.cookies.token){
        return res.redirect(baseUrl)
    }
    const {token} = req.cookies
    
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if(err){
            logger.error(`Error in middleware : ${err}`)
            return res.redirect(baseUrl)
        }
        const {_id} = payload
        readUser({_id: _id}).then(savedUser=> {
            savedUser.password = undefined
            res.locals.authUser= savedUser
            next()
        }).catch(err=> {
            logger.error(`Error in middleware : ${err}`)
            return res.redirect(baseUrl)
        })
    })
}

const checkAuthenAPI = (req, res, next) => {
    if(!req.cookies || !req.cookies.token){
        return res.status(404).json({err: 'No login found'})
    }
    const {token} = req.cookies
    
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if(err){
            logger.error(`Error in middleware : ${err}`)
            return res.status(404).json({err: 'Error in middleware'})
        }
        const {_id} = payload
        readUser({_id: _id}).then(savedUser=> {
            res.locals.authUser= savedUser
            next()
        }).catch(err=> {
            logger.error(`Error in middleware : ${err}`)
            return res.status(404).json({err: 'Invalid token'})
        })
    })
}

module.exports = {
    checkAuthen: checkAuthen,
    checkAuthenAPI: checkAuthenAPI
}
