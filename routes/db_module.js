const config = process.webConf;
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const User = mongoose.model('User')

const saveUser = (newUser)=>{
    return new Promise((resolve, reject )=> {
        newUser.save().then((savedUser) => {
            console.log("Saved => "+savedUser.username)
            resolve(savedUser)
            return
        }).catch((err) => {
            console.log(err)
            return reject('Cannot Save '+saveUser.username)
        })
    }) 
}

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
                            saveUser(user).then(savedUser => {
                                resolve(savedUser)
                            }).catch(err => {
                                throw err
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
        }).catch(err=> {
            reject(err.message)
        })
    })
}



const updateUser = (username, newUserData, allowAdmin) => {
    return new Promise((resolve, reject) => {
        if(!username || !newUserData || allowAdmin==undefined){
            reject('Invalid arguments')
            return
        }

        User.findOne({username: username}).then(savedUser => {
            if(!savedUser){
                reject('User not found')
                return
            }
            if(savedUser.role == 'admin' && allowAdmin==false){
                console.log('cannot change admin')
                reject('Admin cannot be changed')
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
            reject(err)
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

const readAllUser= (pattern) => {
    return new Promise ((resolve, reject)=> {
        User.find(pattern).select('-password').then(usersData => {
            if(!usersData ){
                reject('Error in db response');
            }
            resolve(usersData);
        })
    }) 
}



module.exports ={
    createUser: createUser,
    readUser: readUser,
    updateUser: updateUser,
    deleteUser: deleteUser,
    readAllUser: readAllUser
}