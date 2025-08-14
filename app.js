var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var engine = require('ejs-mate');

var indexRouter = require('./routes/index');
var repuestosRouter = require('./routes/repuestos');
var usersRouter = require('./routes/users');
var ventasPageRouter = require('./routes/ventasPage'); // <-- NUEVO

var app = express();

// View engine + ejs-mate
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', indexRouter);
app.use('/repuestos', repuestosRouter);
app.use('/users', usersRouter);
app.use('/historial-ventas', ventasPageRouter); // <-- NUEVO

// 404
app.use(function(req, res, next) { next(createError(404)); });
// Handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
