var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//database requirements
const sequelize = require('./models').sequelize;

//connect & sync to the database
sequelize.authenticate()
  .then(console.log('Connected to the database!'))
  .catch(err => {console.error('Error connecting to database:', err)});
sequelize.sync().then(() => {
	app.listen(3000, () => {console.log('\App now running on port 3000 :)') });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//static assets
app.use('/static', express.static('public'));

//preset code created when making the app
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//redirect home route to books route!
app.get('/', (req, res) => {
  res.redirect('/books');
});

//catch undefinted routes to 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//error handler
app.use(function(err, req, res, next) {
  //set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  // console.log(err.message, err.status);

  //is the error a 404?
  if (err.status == 404) {
    res.render('page-not-found', {title: "Page Not Found"});
  } else {
    //set status to 500 if not already defined
    res.status(err.status || 500);
    res.render('error', {title: "Server Error", error:err });
  }
});

module.exports = app;
