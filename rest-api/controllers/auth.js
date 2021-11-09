/*
 * Dependencies
 */
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

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


exports.login = (req, res, next) => {
  const { body: { email, password } } = req;
  let loadedUser;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        const error = new Error('user not found');
        error.statusCode = 401;
        throw error;
      }

      loadedUser = user;
      return bcrypt.compare(password, user.password);
    }).then(isEqual => {
      if (!isEqual) {
        const error = new Error('user not found');
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign({
        email: loadedUser.email,
        userId: loadedUser._id.toString()
      }, 'secret', { expiresIn: '1h' });

      res.status(200)
        .json({ token, userId: loadedUser._id.toString() })
    })
    .catch(err => { catchError(err, next) })
}


exports.getStatus = (req, res, next) => {
  const { userId } = req;

  User.findById(userId)
    .then(user => {
      if (!user) {
        const error = new Error('user not found');
        error.statusCode = 404;
        throw error;
      }

      res
        .status(200)
        .json({
          status: user.status,
        });
    })
    .catch(err => {
      catchError(err, next);
    });
}

exports.updateStatus = (req, res, next) => {
  const errors = validationResult(req);
  const { userId, body: { status } } = req;

  if (!errors.isEmpty()) {
    const error = new Error('validation Failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  User.findById(userId)
    .then(user => {
      if (!user) {
        const error = new Error('user not found');
        error.statusCode = 401;
        throw error;
      }
      user.status = status;
      return user.save()
    })
    .then((user) => {
      res
        .status(201)
        .json({
          status: user.status
        })
    })
    .catch(err => {
      catchError(err, next);
    });
}