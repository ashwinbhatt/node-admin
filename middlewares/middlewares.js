const config = process.webConf;
const jwt = require('jsonwebtoken')
const {readUser} = require('../routes/db_module')
const JWT_SECRET = config.JWT_SECRET

function checkAuthen(req, res, next) {
    const {authorization} = req.headers
    
    if(!authorization){
        return res.status(401).json({error : 'You are not authorised'})
    }
    const token = authorization.replace("token ", "")
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if(err){
            return res.status(401).json({error: 'You are not authorised'})
        }
        const {_id} = payload
        readUser({_id: _id}).then(savedUser=> {
            savedUser.password = undefined
            res.locals.authUser= savedUser
            next()
        }).catch(err=> {
            return res.status(401).json({error: 'You are authorised'})
        })
    })
}

module.exports = {
    checkAuthen: checkAuthen
}
