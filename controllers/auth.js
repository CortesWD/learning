const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    docTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn,
  });
}

exports.postLogin = (req, res, next) => {
  User.findById('6181d18464331b871a837b2f')
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      // to assure the session was updated
      req.session.save((err) => {
        if (err) console.log(err);
        res.redirect('/');
      });
    })
    .catch(err => console.log(err))

}

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect('/');
  })
}