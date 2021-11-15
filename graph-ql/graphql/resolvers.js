/*
 * Dependencies
 */
const bcrypt = require('bcrypt');
const validator = require('validator');

/*
 * Models
 */
const User = require('./../models/user');

exports.createUser = async ({ userInput }, req) => {
  const { email, password, name } = userInput;

  const userExist = await User.findOne({ email });
  const errors = [];

  if (!validator.isEmail(email)) {
    errors.push({ message: 'email invalid' });
  }

  if (validator.isEmpty(password) || !validator.isLength(password, { min: 5 })) {
    errors.push({ message: 'password invalid' });
  }

  if (errors.length) {
    const error = new Error('invalid input');
    error.data = errors;
    error.code = 422;
    throw error;
  }

  if (userExist) {
    const error = new Error('user exist');
    throw error;
  }

  const hashPass = await bcrypt.hash(password, 12);

  const user = new User({
    email,
    name,
    password: hashPass
  });

  const createdUser = await user.save();

  return {
    //** _doc contains only the data that whe need to send */
    ...createdUser._doc,
    _id: createdUser._id.toString()
  };
}