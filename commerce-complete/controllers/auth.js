/*
 * Dependencies
 */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

/*
 * Models
 */
const User = require('../models/user');
const { catchError } = require('../util/catch-error');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: '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'
  }
}));


exports.getLogin = (req, res, next) => {
  const errors = req.flash('error');
  res.render('auth/login', {
    path: '/login',
    docTitle: 'Login',
    errorMessage: errors.length ? errors[0] : null,
    formData: {},
    errors: false
  });
}

exports.getSignup = (req, res, next) => {
  const errors = req.flash('error');
  res.render('auth/signup', {
    path: '/signup',
    docTitle: 'Signup',
    errorMessage: errors.length ? errors[0] : null,
    formData: {},
    errors: []
  });
};

exports.postLogin = (req, res, next) => {
  const { body } = req;
  const { email, password } = body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      docTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      formData: body,
      errors: true
    });
  }

  User.findOne({ email })
    .then((user) => {
      bcrypt.compare(password, user.password)
        .then((match) => {
          if (match) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            // to assure the session was updated
            return req.session.save((err) => {
              if (err) console.log(err);
              res.redirect('/');
            });
          } else {
            req.flash('error', 'invalid email/password');
            return res.redirect('/login');
          }
        })
        .catch(err => {
          catchError(err, next)
        });
    })
    .catch(err => catchError(err, next))
}

exports.postSignup = (req, res, next) => {
  const { body } = req;
  const {
    email,
    password: userPswd,
    confirmPassword
  } = body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      docTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      formData: body,
      errors: errors.array()
    });
  }

  return bcrypt.hash(userPswd, 12)
    .then((password) => {
      const user = new User({ email, password, cart: { items: [] } })
      return user.save();
    })
    .then(() => {
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: 'cristiancortes@outlook.com',
        subject: 'signed Up!',
        html: '<h1>Welcome, you successfuly signed up</h1>'
      });
    })
    .catch(err => catchError(err, next));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    res.redirect('/');
  })
}

exports.getReset = (req, res, next) => {
  const errors = req.flash('error');
  res.render('auth/reset', {
    path: '/reset',
    docTitle: 'Reset',
    errorMessage: errors.length ? errors[0] : null,
  });
}

exports.postReset = (req, res, next) => {
  const { body: { email } } = req;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) return res.redirect('/reset');

    const token = buffer.toString('hex');

    User.findOne({ email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account found')
          return res.redirect('/reset');
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect('/');
        return transporter.sendMail({
          to: email,
          from: 'cristiancortes@outlook.com',
          subject: 'reset your password',
          html: `
            <p>Reset your password <a href="http://localhost:3000/reset/${token}">here </a></p>
          `
        });
      })
      .catch(err => catchError(err, next))
  })
}

exports.getNewPassword = (req, res, next) => {
  const { params: { resetToken } } = req;
  const errors = req.flash('error');

  /* $gt is an mongoose operator to make a query "greater than" */
  User.findOne({ resetToken, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      res.render('auth/new-password', {
        path: '/new-password',
        docTitle: 'New Password',
        errorMessage: errors.length ? errors[0] : null,
        userId: user._id.toString(),
        passwordToken: resetToken
      });
    })
    .catch(err => console.log(err))
}

exports.postNewPassword = (req, res, next) => {
  const { body: { password, userId, passwordToken } } = req;
  let foundUser;

  User.findOne({ _id: userId, resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      foundUser = user;
      return bcrypt.hash(password, 12);
    })
    .then(updatedPassword => {
      foundUser.password = updatedPassword;
      foundUser.resetToken = null;
      foundUser.resetTokenExpiration = null;
      return foundUser.save();
    })
    .then(() => res.redirect('/login'))
    .catch(e => console.log(e))
}