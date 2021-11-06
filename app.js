/*
 * Dependencies
 */
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const MONGODB_URI = 'mongodb://localhost:27017/shop';

/*
 * Models
 */
const User = require('./models/user');

/*
 * Routes
 */
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

/*
 * Controllers
 */
const { get404, get500 } = require('./controllers/errors');
const { catchError } = require('./util/catch-error');

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

const csrfProtection = csrf();

app.set('view engine', 'ejs');
/* views is the default dir */
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store
}));

app.use(csrfProtection);

app.use(flash());


app.use((req, res, next) => {
  /**
   * Locals is to set vars across all requests
   */
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  const { session } = req;
  const { user } = session;
  if (!user) return next();

  User.findById(user._id)
    .then((user) => {
      if (!user) return next();
      req.user = user;
      next();
    })
    .catch(err => catchError(err, next));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500', get500);
app.use(get404);

/**
 *  Error middleware to handle errors
 * when next(error) its called
 */
app.use((error, req, res, next) => {
  // res.status(500).render('500', {
  //   docTitle: 'Server Error',
  //   path: null,
  // });
  res.redirect('/500');
});

mongoose.connect(MONGODB_URI)
  .then(() => {
    app.listen(3000);
  })
  .catch(err => console.log(err));