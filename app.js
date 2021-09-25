const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser');
const expressSession = require('express-session')
const logger = require('morgan');
const mongoose = require('mongoose')
require('dotenv').config()
const PORT = process.env.PORT || 7000

const indexRouter = require('./routes/index');
const MongoStore = require('connect-mongo')(session)
const app = express();
const session = {
  secret: process.env.SESSION_SECRET,
  cookie: {},
  resave: false,
  saveUninitialized: false
}
// Connect DB
mongoose
  .connect(process.env.ATLAS_URI)
  .then(() => console.log('mongoDB is connected'))
  .then(
    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`)
    })
  )
  .catch((err) => console.log(err))

app.use(logger('dev'));
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet())
app.use(express.static(path.join(__dirname, 'pages')));

app.use({ secret: process.env.SESSION_SECRET, store: new MongoStore(session) })
app.use('/', indexRouter);
app.use('/product', require('./routes/Product'));
app.use('/categories', require('./routes/Category'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
  })
}
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
