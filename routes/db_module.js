const config = process.webConf;
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const User = mongoose.model('User')


const createUser = (username, password, role) => {
    return new Promise((resolve, reject) => {
        if(!username || !password || !role){
            reject('Invalid arguments')
        }
        User.findOne({username: username})
            .then((savedUser) => {
                if(savedUser){
                    console.log(username +' already exits')
                    reject(username +' exists')
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
                            user.save().then((savedUser) => {
                                console.log("Created user => "+savedUser.username)
                                // res.json({message: "Saved User successfully"})
                                resolve('Created User succesfully')
                                return
                            }).catch((err) => {
                                reject('Data does not fit User schema')
                                return 
                            })
                        });
            }).catch((err) => {
                console.log(err.message)
                reject('Could not create User')
                return 
            })
    })
}


const readUser =  (userSearchData) => {
    return new Promise((resolve, reject) => {
        if(!userSearchData){
            reject('Invalid arguments');
            return
        }
        User.findOne(userSearchData).then(savedUser => {
            if(!savedUser){
                reject('User not found')
                return
            }
            resolve(savedUser)
            return
        })
    })
}



const updateUser = (username, newUserData) => {
    return new Promise((resolve, reject) => {
        if(!username || !newUserData){
            reject('Invalid arguments')
        }
        User.findOne({username: username}).then(savedUser => {
            if(!savedUser){
                reject('User not found')
            }

            bcrypt.hash(newUserData.password, config.password.saltRounds).then( hashedPass => {
                savedUser.username = newUserData.username
                savedUser.password = hashedPass
                savedUser.role = newUserData.role
                savedUser.save().then((savedUser) => {
                    console.log("Updated user succesfully => "+savedUser.username)
                    resolve(savedUser)
                    return
                }).catch((err) => {
                    console.log(err)
                    return reject('Cannot Update User')
                })
            })
        })
    })
}


const deleteUser = (username) => {
    return new Promise((resolve, reject) => {
        if(!username){
            reject('Invalid arguments')
            return
        }

        User.findOne({username: username}).then((savedUser) => {
            if(!savedUser){
                throw 'user not found'
            }

            User.deleteOne({username: username}).then(()=> {
                console.log('Deleted '+username)
                resolve('User Deleted')
                return
            }).catch(err=> {
                reject('Cannot Delete User')
                return
            })
        }).catch(err=> {
            console.log('User not found')
            reject('User not found')
        })

    })
}


module.exports ={
    createUser: createUser,
    readUser: readUser,
    updateUser: updateUser,
    deleteUser: deleteUser
}