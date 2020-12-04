const mongoose = require('mongoose')
const express = require('express')
const app = express()
app.set('view engine', 'ejs');
const CONFIG_PATH = '../../configs/node-admin-config.json'
const config = require(CONFIG_PATH)
const port = 5000;
var cookieParser = require('cookie-parser');


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
app.use(require('./routes/user'))
app.use(require('./test'))
app.use(require('./routes/pages'))

app.listen(port, () => {
    logger.info(`Server running on port ${port} 🔥`)
});