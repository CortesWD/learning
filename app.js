/*
 * Dependencies
 */
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

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
  User.findById('6181d18464331b871a837b2f')
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err))
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(get404);

mongoose.connect('mongodb://localhost:27017/shop')
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