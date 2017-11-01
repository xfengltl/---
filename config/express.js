const express = require('express');
const glob = require('glob');

const favicon = require('serve-favicon');
const logger = require('morgan');
const moment = require('moment');
const truncate = require('truncate');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

var session = require('express-session');
var flash = require('connect-flash');
var messages = require('express-messages');
// var MongoStore = require('connect-mongo')(session);

var Category = mongoose.model('Category');

module.exports = (app, config) => {
	const env = process.env.NODE_ENV || 'development';
	app.locals.ENV = env;
	app.locals.ENV_DEVELOPMENT = env == 'development';

	app.set('views', config.root + '/app/views');
	app.set('view engine', 'jade');

	app.use(function (req, res, next) {
		app.locals.pageName = req.path;
		app.locals.moment = moment;
		app.locals.truncate = truncate;

		Category.find({}).sort('-created').exec(function (err, categories) {
			if (err) {
				return next(err);
			}
			app.locals.categories = categories;
			next();
		});
		// Category.find({}).exec((err, categories) => {
		//   if (err) {
		//     return next(err);
		//   }
		//   app.locals.categories = categories;
		//   next();
		// });

	});
	// app.use(favicon(config.root + '/public/img/favicon.ico'));
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(cookieParser());

	app.use(session({
		secret: 'nodeblog',
		resave: false,
		saveUninitialized: true,
		cookie: {
			secure: false
		},
		// store: new MongoStore({ mongooseConnection: connection })
	}));
	app.use(flash());
	app.use(function (req, res, next) {
		res.locals.messages = messages(req, res);
		// app.locals.user = req.user;
		// console.log(req.session, app.locals.user);
		next();
	});
	app.use(compress());
	app.use(express.static(config.root + '/public'));
	app.use(methodOverride());

	var controllers = glob.sync(config.root + '/app/controllers/**/*.js');
	// console.log(controllers);
	controllers.forEach((controller) => {
		// console.log(controller);
		 require(controller)(app);
	});

	app.use((req, res, next) => {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	if (app.get('env') === 'development') {
		app.use((err, req, res, next) => {
			res.status(err.status || 500);
			res.render('error', {
				message: err.message,
				error: err,
				title: 'error'
			});
		});
	}

	app.use((err, req, res, next) => {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: {},
			title: 'error'
		});
	});

	return app;
};
