const {config, logger} = process.admin
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const User = mongoose.model('User')

const saveUser = (newUser)=>{
    return new Promise((resolve, reject )=> {
        newUser.save().then((savedUser) => {
            logger.info(`Saved user : ${savedUser.username}`);
            resolve(savedUser)
            return
        }).catch((err) => {
            logger.err(`Cannot save user : ${err}`)
            return reject('Could not save the user.')
        })
    }) 
}

const createUser = (username, password, role) => {
    return new Promise((resolve, reject) => {
        if(!username || !password || !role){
            logger.error('Provide username, password and role.')
            reject('Bad call')
        }
        User.findOne({username: username})
            .then((savedUser) => {
                if(savedUser){
                    logger.verbose(`${username} already exists`)
                    reject(`${username} already exists`)
                    return
                }
                bcrypt.hash(password, config.password.saltRounds)
                        .then( hashedPass => {
                            const user =new User({
                                username: username,
                                password: hashedPass,
                                creation_stamp: new Date(Date.now()),
                                role: role
                            })
                            saveUser(user).then(savedUser => {
                                resolve(savedUser)
                            }).catch(err => {
                                reject(err)
                            })
                        });
            }).catch((err) => {
                logger.error(`Could not create user : ${err.message}`)
                reject('Could not create User')
                return 
            })
    })
}


const readUser =  (userSearchData) => {
    return new Promise((resolve, reject) => {
        if(!userSearchData){
            logger.error(`Prove userSearchData`)
            reject('Bad call')
            return
        }
        User.findOne(userSearchData).then(savedUser => {
            if(!savedUser){
                logger.verbose('User not found')
                reject('User not found')
                return
            }
            resolve(savedUser)
            return
        }).catch(err=> {
            logger.error('Error while searching for a user. : err.message')
            reject('Could no do a search')
        })
    })
}



const updateUser = (username, newUserData, allowAdmin) => {
    return new Promise((resolve, reject) => {
        if(!username || !newUserData || allowAdmin==undefined){
            logger.error(`Provide username, newUserData, allowAdmin parameters`)
            reject('Bad call')
            return
        }

        User.findOne({username: username}).then(savedUser => {
            if(!savedUser){
                logger.verbose(`${username} not found`)
                reject('User not found')
                return
            }
            if(savedUser.role == 'admin' && allowAdmin==false){
                logger.warn('cannot change admin')
                reject('Admin permissions cannot be changed')
                return
            }
            
            if(newUserData.role){
                savedUser.role = newUserData.role
            }

            saveUser(savedUser).then(saveUser=> {
                resolve(saveUser)
                return
            }).catch(err=> {
                reject(err)
                return
            })        

        }).catch(err=> {
            logger.error(`Error while changing permissions : ${err}`)
            reject('Error in updating user')
        })
    })
}


const deleteUser = (username) => {
    return new Promise((resolve, reject) => {
        if(!username){
            logger.error('Provide username')
            reject('Bad argument')
            return
        }

        User.findOne({username: username}).then((savedUser) => {
            if(!savedUser){
                logger.verbose(`${username} not found`)
                reject('User not found')
            }

            User.deleteOne({username: username}).then(()=> {
                logger.info(`Deleted user : ${username}`)
                resolve('User Deleted')
                return
            }).catch(err=> {
                logger.error(`Error in deleting user : ${err}`)
                reject('Cannot Delete User')
                return
            })
        }).catch(err=> {
            logger.error('Error in finding user : ${err')
            reject('Error in deleting user')
        })

    })
}

const readAllUser= (pattern) => {
    return new Promise ((resolve, reject)=> {
        User.find(pattern).select('-password').then(usersData => {
            if(!usersData ){
                reject('Cannot get userdata');
            }
            resolve(usersData);
        })
    }) 
}

const updateAUser = (username, password) => {
    return new Promise((resolve, reject) => {
        if(!username || !password){
            logger.error('Provide username and password')
            return reject('Bad argument')
        }
        User.findOne({username: username})
            .then((savedUser) => {
                if(!savedUser){
                    logger.error(`${username} not found`)
                    return reject('User not found')
                }
                bcrypt.hash(password, config.password.saltRounds).then( hashedPass => {
                    savedUser.password = hashedPass
                    saveUser(savedUser).then(savedUser => {
                        return resolve(savedUser)
                    }).catch(err => {
                        return reject(err)
                    })
                });
            }).catch((err) => {
                logger.error(`Error in updating password : ${err}`)
                return reject('User not found')
            })
    })
}


module.exports ={
    createUser: createUser,
    readUser: readUser,
    updateUser: updateUser,
    deleteUser: deleteUser,
    readAllUser: readAllUser,
    updateAUser: updateAUser
}