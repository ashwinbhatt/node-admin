const {config, logge, baseUrl} = global.APP_VARIABLES
const jwt = require('jsonwebtoken')
const {readUser} = require('../routes/db_module')
const JWT_SECRET = config.JWT_SECRET

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

module.exports = {
    checkAuthen: checkAuthen
}
