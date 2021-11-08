/*
 * Dependencies
 */
const { validationResult } = require('express-validator');

/*
 * Models
 */
const Post = require('./../models/post');

/*
 * Others
 */
const { catchError } = require('../util/catch-error');


exports.getPosts = (req, res, next) => {
  Post.find()
    .then(postsDoc => {
      res.status(200)
        .json({ posts: postsDoc })
    })
    .catch(err => {
      catchError(err, next);
    })
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  const {
    // body: { title, content },
    body,
  } = req;

  if (!errors.isEmpty()) {
    const error = new Error('validation failed');
    error.statusCode = 422;
    throw error;
  }

  const post = new Post({
    ...body,
    imageUrl: 'images/bbcdune.jpg',
    creator: {
      name: 'Cris'
    }
  });

  post.save()
    .then(result => {
      res
        .status(201)
        .json({
          message: 'created successfully',
          post: result
        })
    })
    .catch(err => {
      catchError(err, next);
    })
}

exports.getPost = (req, res, next) => {
  const { params: { postId } } = req;

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('post not found');
        error.statusCode = 404;
        throw error;
      }

      res.status(200)
        .json({ post })
    })
    .catch(err => {
      catchError(err, next);
    })
}