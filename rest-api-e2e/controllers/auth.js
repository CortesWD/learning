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

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  const { body } = req;
  const { password } = body;

  if (!errors.isEmpty()) {
    const error = new Error('validation Failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  try {
    const secPassword = await bcrypt.hash(password, 12);

    const user = new User({
      ...body,
      password: secPassword
    });

    const savedUser = await user.save();

    res.status(201)
      .json({
        message: 'user created',
        userId: savedUser._id
      });

  } catch (error) {
    catchError(error, next)
  }
}

exports.login = async (req, res, next) => {
  const { body: { email, password } } = req;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error('invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({
      email: user.email,
      userId: user._id.toString()
    }, 'secret', { expiresIn: '1h' });

    res.status(200)
      .json({ token, userId: user._id.toString() })
    return;
  } catch (error) {
    return catchError(error, next);
  }
}

exports.getStatus = async (req, res, next) => {
  const { userId } = req;

  try {
    const user = await User.findById(userId);
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
  } catch (error) {
    catchError(error, next)
  }
}

exports.updateStatus = async (req, res, next) => {
  const errors = validationResult(req);
  const { userId, body: { status } } = req;

  if (!errors.isEmpty()) {
    const error = new Error('validation Failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('user not found');
      error.statusCode = 401;
      throw error;
    }

    user.status = status;
    const updatedUser = await user.save();

    res
      .status(201)
      .json({
        status: updatedUser.status
      })
  } catch (error) {
    catchError(error, next);
  }
}