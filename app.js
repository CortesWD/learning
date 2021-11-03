/*
 * Dependencies
 */
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

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
const { get404 } = require('./controllers/errors');

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

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

app.use((req, res, next) => {
  const { session } = req;
  const { user } = session;
  if (!user) return next();
  /* This is to keep every request with the dummy user */
  User.findById(user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err))
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(get404);

mongoose.connect(MONGODB_URI)
  .then(() => {
    User.findOne()
      .then(user => {
        if (!user) {
          const user = new User({
            name: 'Cris',
            email: 'test@test.com',
            cart: { items: [] }
          })
          user.save();
        }
      });
    app.listen(3000)
  })
  .catch(err => console.log(err));