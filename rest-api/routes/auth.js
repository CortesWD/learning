/*
 * Dependencies
 */
const express = require('express');
const { body } = require('express-validator');

/*
 * Middleware
 */
const isAuth = require('./../middleware/is-auth');

/*
 * Controllers
 */
const authController = require('./../controllers/auth');


/*
 * Models
 */
const User = require('./../models/user');

const {
  signup,
  login,
  getStatus,
  updateStatus
} = authController;

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
};

const statusValidations = () => {
  return [
    body('status')
      .trim()
      .isString()
      .not()
      .isEmpty()
  ]
};

router.put('/signup', signupValidations(), signup);
router.post('/login', login);
router.get('/status', isAuth, getStatus);
router.patch('/status', isAuth, statusValidations(), updateStatus);

module.exports = router;