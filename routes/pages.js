const { config, logger, baseUrl } = global.APP_VARIABLES
const express = require('express')
const router = express.Router()
const { readUser, deleteUser } = require('./db_module')
const { checkAuthen } = require('../middlewares/middlewares')


router.get('/', (req, res) => {
    res.redirect(baseUrl + '/login')
});


router.get('/login', (req, res) => {
    res.render('login.ejs', { 'url_base': baseUrl })
});

router.get('/signup', checkAuthen, (req, res) => {
    const { authUser } = res.locals
    const loggedUserPage = '/user/'+authUser.username
    if (res.locals.authUser.role != 'admin') {
        return res.status(401).json({ error: 'You are not authorised to add a user !' })
    }
    res.render('signup.ejs', { 
        'url_base': baseUrl, 
        'logged_user': authUser.username,
        'loggedUserPage': loggedUserPage
    })
});

router.get('/update', checkAuthen, (req, res) => {
    const { authUser } = res.locals
    const loggedUserPage = '/user/' + authUser.username
    if (authUser.role != 'admin') {
        return res.status(422).json({ error: 'Update privillage denied' })
    }
    res.render('update.ejs', {
        'url_base': baseUrl,
        'logged_user': authUser.username,
        'loggedUserPage': loggedUserPage
    })
})

router.get('/delete', checkAuthen, (req, res) => {
    const { authUser } = res.locals
    const loggedUserPage = '/user/' + authUser.username
    if (res.locals.authUser.role != 'admin') {
        return res.status(401).json({ error: 'You are not authorised to delete a user !' })
    }
    res.render('delete.ejs', {
        'url_base': baseUrl,
        'logged_user': authUser.username,
        'loggedUserPage': loggedUserPage
    })
})

router.get('/user/:username', checkAuthen, (req, res) => {
    const { authUser } = res.locals
    const loggedUserPage = '/user/' + authUser.username
    if (req.params.username != authUser.username) {
        res.redirect(baseurl + '/login')
    } else {
        var signUrl = null, updateUser = null, deleteUser = null, updateNoAdmin = req.originalUrl + '/update', logsUrl = null;
        if (authUser.role == 'admin') {
            signUrl = baseUrl + '/signup'
            updateUser = baseUrl + '/update'
            deleteUser = baseUrl + '/delete'
            logsUrl = baseUrl + '/logs'
        }
        res.render('userPage.ejs', {
            'url_base': baseUrl,
            'userData': authUser,
            'signUrl': signUrl,
            'updateUser': updateUser,
            'deleteUser': deleteUser,
            'updateNoAdmin': updateNoAdmin,
            'logged_user': authUser.username,
            'loggedUserPage': loggedUserPage,
            'logsUrl': logsUrl
        })
    }
})

router.get('/user/:username/update', checkAuthen, (req, res) => {
    const { authUser } = res.locals
    const { username } = req.params
    const loggedUserPage = '/user/' + authUser.username

    if (!username) {
        return res.status(422).json({ error: 'Provide username and password' })
    }

    if (authUser.username != username) {
        return res.status(422).json({ error: 'You must be logged in as ' + username });
    }

    res.render('userUpdate.ejs', {
        'success_redirect': baseUrl + '/user' + username,
        'url_base': baseUrl,
        'logged_user': authUser.username,
        'loggedUserPage': loggedUserPage
    })
});


router.get('/jsonlogs', checkAuthen, (req, res) => {
    const { authUser } = res.locals
    if (authUser.role != 'admin') {
        return res.status(422).json({ error: 'Update privillage denied' })
    }

    logger.logger.query({}, function (err, results) {
        if (err) {
            logger.error(`Cannot get logs ${err}`)
            return res.status(404).json({ error: 'Error in getting logs' })
        }

        res.json({ message: 'Logs successfully recieved.', logs: results.dailyRotateFile })
    });
})


router.get('/logs', checkAuthen, (req, res) => {
    const { authUser } = res.locals
    const loggedUserPage = '/user/' + authUser.username
    if (authUser.role != 'admin') {
        return res.status(422).json({ error: 'Update privillage denied' })
    }

    res.render('logs.ejs', {
        'url_base': baseUrl,
        'logged_user': authUser.username,
        'loggedUserPage': loggedUserPage
    })
})

// Handling invalid get calls
router.get("*", (req, res) => {
    res.redirect(baseUrl+'/login')
});

module.exports = router