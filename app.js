const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');

const init = (app, CONFIG_PATH) => {
    // Adding Logger 
    const { Logger } = require('./logger/Logger')
    const logger = new Logger('node-admin', {
        logLevel: 'verbose',
        path: config.Logger.path
    })


    // Making config, logger accessable to all files
    process.admin = { config, logger }

    // Setting up the database
    mongoose.connect(config['database']['URI'], {
        useNewUrlParser: true, useUnifiedTopology: true,
        useCreateIndex: true,
    });
    mongoose.connection.on('connected', () => {
        logger.info("MongoDB connected");
    })
    mongoose.connection.on('error', (err) => {
        logger.info('MongoDB failed to connect :' + err)
    })

    // Loading up the database schemas
    require('./models/user')

    // setting up routes from files
    app.use(express.json())
    app.use(cookieParser());
    app.use(express.static('./views/static'));

    // Exports
    return { 
        checkAuthen : require('./middlewares/middlewares')
    }

}





module.exports = {
}