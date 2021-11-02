/*
 * Dependencies
 */
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

/*
 * Mongo DB
 */
const { mongoConnect } = require('./util/database');

/*
 * Models
 */
const User = require('./models/user');

/*
 * Routes
 */
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

/*
 * Controllers
 */
const { get404 } = require('./controllers/errors');


const app = express();


app.set('view engine', 'ejs');
/* views is the default dir */
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  /* This is to keep every request with the dummy user */
  User.findById('61808e096fbab5e17a8c4c04')
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch(err => console.log(err))
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(get404);

mongoConnect(() => {
  app.listen(3000);
});