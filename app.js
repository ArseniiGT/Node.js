const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const staticAsset = require('static-asset');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const config = require('./config');
const routes = require('./routes');
console.log(config.MONGO_URL);
console.log(process.env.MONGO_URL);
console.log(process.env.SESSION_SECRET);
// database
mongoose.Promise = global.Promise;
mongoose.set('debug', config.IS_PRODUCTION);

//Changes below

if (!config.MONGO_URL) {
      return console.log('mongo url not found');
}
mongoose.connect(config.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => console.log("connected to database"))
    .catch(err => console.log(err))

// express
const app = express();

// sessions
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);

// sets and uses
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(staticAsset(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, config.DESTINATION)));
app.use(
  '/javascripts',
  express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist'))
);

// routes
app.use('/', routes.archive);
app.use('/api/auth', routes.auth);
app.use('/post', routes.post);
app.use('/comment', routes.comment);
app.use('/upload', routes.upload);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.render('error', {
    message: error.message,
    error: !config.IS_PRODUCTION ? error : {}
  });
});

app.listen(config.PORT, () =>
  console.log(`Example app listening on port ${config.PORT}!`)
);