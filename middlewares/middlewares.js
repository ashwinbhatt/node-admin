const config = process.webConf;
const jwt = require('jsonwebtoken')
const {readUser} = require('../routes/db_module')
const JWT_SECRET = config.JWT_SECRET

function checkAuthen(req, res, next) {
    if(!req.cookies || !req.cookies.token){
        return res.status(401).json({error : 'You are not authorised'})
    }
    const {token} = req.cookies
    
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if(err){
            console.log(err)
            return res.status(401).json({error: 'You are not authorised'})
        }
        const {_id} = payload
        readUser({_id: _id}).then(savedUser=> {
            savedUser.password = undefined
            res.locals.authUser= savedUser
            next()
        }).catch(err=> {
            console.log(err)
            return res.status(401).json({error: 'You are authorised'})
        })
    })
}

module.exports = {
    checkAuthen: checkAuthen
}
