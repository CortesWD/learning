/*
 * Dependencies
 */
const express = require('express');
const { body } = require('express-validator');

/*
 * Controllers
 */
const authController = require('./../controllers/auth');

/*
 * Models
 */
const User = require('./../models/user');

const { signup } = authController;

const router = express.Router();

const signupValidations = () => {
  return [
    body('email', 'enter valid email')
      .isEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then(userDoc => {
            if(userDoc) return Promise.reject('enter a valid email');
            return true;
          });
      })
      .normalizeEmail(),
      body('password', 'invalid Email')
        .trim()
        .isLength({min: 5}),
      body('name')
        .trim()
        .not().isEmpty()
      
  ];
}

router.put('/signup', signupValidations(), signup);

module.exports = router;