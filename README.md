# node-admin
node-admin provides a subapp that can be integrated with a website to provide admin page handling and it also manages users.

## Requirements
1. express (tested on v4.17.1)
2. mongoose (tested on v5.10.14)
3. bcryptjs (tested on v2.4.3)
4. cookie-parser (tested on v1.4.5)
5. ejs (tested on v3.1.5)
6. jsonwebtoken (tested on v8.5.1)
7. winston (tested on v3.3.3)
8. winston-daily-rotate-file (tested on v4.5.0)

## More about node-admin
* node-admin creates 3 types of users :
    1. admin : have full privillages on resources. Can create, read(check), update(role), delete other users. By default application creates a admin user whose username & password can be configured using config, this user cannot be deleted by any user.
    2. subadmin : This user have full privillages on resources allocated to it. It cannot CRUD any user details except its own password.
    3. tourist : This user can only view resources allocated to it and change password.
    
    >>  node-admin don't allocate any resource as there aren't any, implementor should handle his/her resources in suggested manner.

## Installation.
* This package will be added to npm, currently you could use:
    ```
    npm install https://github.com/ashwinbhatt/node-admin
    ```

## Usage
1. Before using importing firstly we do some pre-requisite.
    ```
    // importing config for node-admin, we will see its creation later
    const node_admin_config = require('./configs/node-admin-config.json')
    // "/admin" will serve as baseUrl for node-admin i.e. all node-admin pages will at "/admin/<something>"
    const node_admin_baseUrl = '/admin'
    ```
2. Importing node_admin and initilizing it. Initilization returns 2 objects `app_admin` (express app for node-admin), `checkAuthenAPI` (a function to be used as middleware)

    ```
    const node_admin = require('node-admin') 
    // Initilizing node-admin.
    const {app_admin, checkAuthenAPI} = node_admin(node_admin_config, node_admin_baseUrl)
    ```
    
3. To Integrate the node-admin app to actual application we do 
    ```
    // node we pass the same string "/admin" to app.use this will actuall integrate subapp to "/admin"
    app.use(node_admin_baseUrl, app_admin)
    ```

## node-admin-config.json
* Previously we import node-admin-config.json which is config file node admin, lets see how it is created. 
    ```
    {
        "database": {
            "URI": <URI> for mongodb database
        },
        "app": {
            // this will be the name used to create logs.
            "appName": "node-admin"
        },
        // Credentials for default created admin user. You can change password later on also.
        "admin": {
            "username": "admin",
            "password": "charlie"
        },
        "password": {
            // parameter for hashing password.
            "saltRounds": 12,
            "password_strength": {
            
                // Boolean to mandate lowercase character in password field.
                "lowerCase": false,
                
                // Boolean to mandate uppercase character in password field.
                "upperCase": false,
                
                // Boolean to mandate numeric character in password field.
                "numeric": false,
                
                // Boolean to mandate special character in password field.
                "specialChar": false,
                
                // Mandate minimum length of password
                "minLength": 1
            }
        },
        "Logger": {
            // Path to directory that contain all the node-admin logs
            "path": "/temp/logs/node-admin",
            
            // maxFiles that logger will allow to create after which logs are rotated.
            // Daily 1 log is created if any.
            "maxFiles": 1
        },
        
        "token": {
            // secret key that hashes the password.
            "JWT_SECRET": "tom&jerry",
            
            // validity of token which is given to user after login in sec
            "token_valid": 86400
        }
    }
    ```

## checkAuthenAPI
* Earlier we saw that during initialization checkAuthenAPI is also returned. Let's see how it works.

* Suppose we have a route and we want to list all the resources of the logged user.
   1. We create a get route and pass checkAuthenAPI as a middleware, if we enter the route for a call the url then the logged user must have been found and added to res.locals. 
    ```
    router.get(<my-route-url>, checkAuthenAPI, (req, res) => {
        const { authUser } = res.locals
        
    })
    ```
   2. authUser is a mongoose object of User Schema.
        <TBD>


    
## ToDo
1. Use mongoose dynamic referencing for User Schema access attribute.
## Commit missions