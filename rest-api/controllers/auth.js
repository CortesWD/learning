/*
 * Dependencies
 */
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

/*
 * Models
 */
const User = require('./../models/user');

/*
 * Others
 */
const { catchError } = require('../util/catch-error');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  const { body } = req;
  const { password } = body;

  if (!errors.isEmpty()) {
    const error = new Error('validation Failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  bcrypt.hash(password, 12)
    .then(ePass => {
      const user = new User({
        ...body,
        password: ePass
      });

      return user.save();
    })
    .then(result => {
      res.status(201)
        .json({
          message: 'user created',
          userId: result._id
        })
    })
    .catch(err => { catchError(err, next) })
}
