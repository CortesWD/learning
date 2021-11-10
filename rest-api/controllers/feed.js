/*
 * Dependencies
 */
const { validationResult } = require('express-validator');

/*
 * Models
 */
const Post = require('./../models/post');
const User = require('./../models/user');

/*
 * Others
 */
const { catchError } = require('./../util/catch-error');
const { deleteFile } = require('./../util/file');

const ITEMS_PER_PAGE = 2;

exports.getPosts = async (req, res, next) => {
  const { query: { page: queryPage = 1 } } = req;
  const page = parseFloat(queryPage);

  try {
    const totalItems = await Post.countDocuments();
    const posts = await Post.find().populate('creator')
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res
      .status(200)
      .json({ posts, totalItems });

  } catch (err) {
    catchError(err, next);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  const { body, file, userId } = req;

  if (!file) {
    const error = new Error('no image sent');
    error.statusCode = 422;
    throw error;
  }

  if (!errors.isEmpty()) {
    const error = new Error('validation failed');
    error.statusCode = 422;
    throw error;
  }

  const post = new Post({
    ...body,
    imageUrl: file.path,
    creator: userId
  });

  try {
    await post.save();
    const user = await User.findById(userId);
    user.posts.push(post);

    await user.save();

    res
      .status(201)
      .json({
        message: 'created successfully',
        post,
        creator: {
          _id: user._id,
          name: user.name
        },
      });

  } catch (error) {
    catchError(error, next);
  }
}

exports.getPost = async (req, res, next) => {
  const { params: { postId } } = req;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('post not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ post });
  } catch (error) {
    catchError(error, next);
  }
}

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);

  const { params: { postId }, body, file, userId } = req;
  const { title, content, image } = body;
  let imageUrl = image;

  if (file) { imageUrl = file.path; }

  if (!imageUrl) {
    const error = new Error('no image provided');
    error.statusCode = 422;
    throw error;
  }

  if (!errors.isEmpty()) {
    const error = new Error('validation failed');
    error.statusCode = 422;
    throw error;
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('post not found');
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== userId) {
      const error = new Error('user not authorized to do this op');
      error.statusCode = 403;
      throw error;
    }

    if (imageUrl !== post.imageUrl) deleteFile(post.imageUrl);

    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;

    const updatedPost = await post.save();

    res.status(201).json({ post: updatedPost });


  } catch (err) {
    catchError(err, next);
  }
};

exports.deletePost = async (req, res, next) => {
  const { params: { postId }, userId } = req;

  try {
    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post) {
      const error = new Error('post not found');
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== userId) {
      const error = new Error('user not authorized to do this op');
      error.statusCode = 403;
      throw error;
    }

    deleteFile(post.imageUrl);

    const deletePost = await Post.findByIdAndRemove(postId);

    if (deletePost) {
      user.posts.pull(postId);
      await user.save();

      res.status(200).json({ message: 'element deleted' });
    };

  } catch (error) {
    catchError(error, next);
  }
}
