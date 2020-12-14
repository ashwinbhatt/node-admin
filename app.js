const mongoose = require('mongoose')
const express = require('express')
const Path = require("path");
const cookieParser = require('cookie-parser');


module.exports = (config, baseUrl) => {
	// Initilizing app
	const app = express()

	// Setting app variables and static files
	app.set("views", Path.join(__dirname, "views"));
	app.set('view engine', 'ejs');
	app.use('/', express.static(Path.join(__dirname, 'views/static')));

	// Adding Logger 
	const { Logger } = require(Path.join(__dirname, 'logger/Logger'))
	const logPath = config.Logger.path


	const logger = new Logger('node-admin', {
		logLevel: 'verbose',
		path: logPath,
	})

	// Making config, logger accessable to whole application
	global.APP_VARIABLES = { config, logger , baseUrl}

	// Setting up the mongodb database
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
	app.use(require('./routes/user'))
	app.use(require('./routes/pages'))

	const checkAuth = require('./middlewares/middlewares')
	return {
		'app_admin': app, 
		checkAuth
	}
}