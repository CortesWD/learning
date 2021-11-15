/*
 * Dependencies
 */
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

/*
 * Models
 */
const User = require('./../models/user');
const Post = require('./../models/post');

/*
 * Other
 */
const { deleteFile } = require('./../util/file');

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

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error('error with user');
    error.code = 401;
    throw error;
  }

  const isEqual = await bcrypt.compare(password, user.password);

  if (!isEqual) {
    const error = new Error('error with user');
    error.code = 401;
    throw error;
  }

  const token = jwt.sign({
    userId: user._id.toString(),
    email: user.email
  }, 'secret', { expiresIn: '1h' });

  return {
    token,
    userId: user._id.toString()
  }
}

exports.createPost = async ({ postInput }, req) => {
  const { isAuth, userId } = req;
  const { title, content, imageUrl } = postInput;
  const errors = [];

  if (!isAuth) {
    const error = new Error('not auth');
    error.code = 401;
    throw error;
  }

  if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
    errors.push({ message: 'title is invalid' });
  }

  if (validator.isEmpty(content) || !validator.isLength(content, { min: 5 })) {
    errors.push({ message: 'content is invalid' });
  }

  if (errors.length) {
    const error = new Error('invalid input');
    error.data = errors;
    error.code = 422;
    throw error;
  }

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('invalid user');
    error.data = errors;
    error.code = 401;
    throw error;
  }

  const post = new Post({
    title,
    content,
    imageUrl,
    creator: user
  });


  const createdPost = await post.save();

  user.posts.push(createdPost);
  await user.save();

  return {
    ...createdPost._doc,
    _id: createdPost._id.toString(),
    createdAt: createdPost.createdAt.toISOString(),
    updatedAt: createdPost.updatedAt.toISOString()
  }
}

exports.posts = async ({ page = 1 }, req) => {
  const { isAuth, userId } = req;
  const perPage = 2;

  if (!isAuth) {
    const error = new Error('not auth');
    error.code = 401;
    throw error;
  }

  const totalPosts = await Post.find().countDocuments();
  const posts = await Post
    .find()
    .sort({ createdAt: - 1 })
    .skip((page - 1) * perPage)
    .limit(perPage)
    .populate('creator');

  return {
    posts: posts.map(p => {
      return {
        ...p._doc,
        _id: p._id.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString()
      }
    }),
    totalPosts
  }
}

exports.post = async ({ id }, req) => {
  const { isAuth } = req;

  if (!isAuth) {
    const error = new Error('not auth');
    error.code = 401;
    throw error;
  }

  const post = await Post.findById(id).populate('creator');

  if (!post) {
    const error = new Error('no post found');
    error.code = 404;
    throw error;
  }

  return {
    ...post._doc,
    _id: post._id.toString(),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString()
  }

}

exports.updatePost = async ({ id, postInput }, req) => {
  const { isAuth, userId } = req;
  const { title, content, imageUrl } = postInput;
  const errors = [];

  if (!isAuth) {
    const error = new Error('not auth');
    error.code = 401;
    throw error;
  }

  const post = await Post.findById(id).populate('creator');

  if (!post) {
    const error = new Error('no post found');
    error.code = 404;
    throw error;
  }

  if (post.creator._id.toString() !== userId.toString()) {
    const error = new Error('not auth');
    error.code = 403;
    throw error;
  }

  if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
    errors.push({ message: 'title is invalid' });
  }

  if (validator.isEmpty(content) || !validator.isLength(content, { min: 5 })) {
    errors.push({ message: 'content is invalid' });
  }

  if (errors.length) {
    const error = new Error('invalid input');
    error.data = errors;
    error.code = 422;
    throw error;
  }

  post.title = title;
  post.content = content;

  if (imageUrl !== 'undefined') post.imageUrl = imageUrl;

  const updatedPost = await post.save();

  return {
    ...updatedPost._doc,
    _id: updatedPost._id.toString(),
    createdAt: updatedPost.createdAt.toISOString(),
    updatedAt: updatedPost.updatedAt.toISOString()
  }
}

exports.deletePost = async ({ id }, req) => {
  const { isAuth, userId } = req;
  if (!isAuth) {
    const error = new Error('not auth');
    error.code = 401;
    throw error;
  }

  const post = await Post.findById(id);

  if (!post) {
    const error = new Error('no post found');
    error.code = 404;
    throw error;
  }

  if (post.creator.toString() !== userId.toString()) {
    const error = new Error('not auth');
    error.code = 403;
    throw error;
  }

  deleteFile(post.imageUrl);

  await Post.findByIdAndRemove(id);
  const user = await User.findById(userId);

  user.posts.pull(id);

  await user.save();

  return true;
}

exports.user = async (args, req) => {
  const { isAuth, userId } = req;

  if (!isAuth) {
    const error = new Error('not auth');
    error.code = 401;
    throw error;
  }

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('error with user');
    error.code = 401;
    throw error;
  }

  return {
    ...user._doc,
    _id: user._id.toString()
  }
}

exports.updateStatus = async ({ status }, req) => {
  const { isAuth, userId } = req;

  if (!isAuth) {
    const error = new Error('not auth');
    error.code = 401;
    throw error;
  }

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('error with user');
    error.code = 401;
    throw error;
  }

  user.status = status;

  await user.save();

  return {
    ...user._doc,
    _id: user._id.toString()
  }

}