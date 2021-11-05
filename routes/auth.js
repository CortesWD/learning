/*
 * Dependencies
 */
const express = require('express');
const { check, body } = require('express-validator');

/*
 * Models
 */
const User = require('./../models/user');

const router = express.Router();

const {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
  getReset,
  postReset,
  getNewPassword,
  postNewPassword
} = require('../controllers/auth');

const passwordValidation = () => {
  return body('password', 'please enter a valid password')
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim()
}

const signUpValidation = () => {
  return [
    check('email')
      .isEmail()
      .withMessage('bad email')
      .custom((value, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('email forbidden')
        // }
        // return true;
        return User.findOne({ email: value })
          .then(userDoc => {
            if (userDoc) {
              return Promise.reject('Email already exist');
            }
          });
      })
      .normalizeEmail(),
    passwordValidation(),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) throw new Error('Passwords have to match');
        return true
      })
      .trim(),
  ]
};

const loginValidation = () => {
  return [
    body('email', 'invalid email/password')
      .isEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then(userDoc => {
            if (!userDoc) return Promise.reject();
          });
      })
      .normalizeEmail(),
    passwordValidation()
  ]
}

router.get('/login', getLogin);
router.get('/signup', getSignup);
router.post('/login', loginValidation(), postLogin);
router.post('/signup', signUpValidation(), postSignup);
router.post('/logout', postLogout);
router.get('/reset', getReset);
router.post('/reset', postReset);
router.get('/reset/:resetToken', getNewPassword);
router.post('/new-password', postNewPassword);

module.exports = router;