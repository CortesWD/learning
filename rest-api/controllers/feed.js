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
const { deleteFile } = require('./../util/file');

const ITEMS_PER_PAGE = 2;

exports.getPosts = (req, res, next) => {
  const { query: { page: queryPage = 1 }} = req;
  const page = parseFloat(queryPage);
  let totalItems;

  Post.countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(postsDoc => {
      res.status(200)
        .json({
          posts: postsDoc,
          totalItems
        })
    })
    .catch(err => {
      catchError(err, next);
    })
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  const { body, file } = req;

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
    });
}

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);

  const { params: { postId }, body, file } = req;
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

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('post not found');
        error.statusCode = 404;
        throw error;
      }
      // Delete old images
      if (imageUrl !== post.imageUrl) deleteFile(post.imageUrl);

      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;

      return post.save();
    })
    .then(resp => {
      res.status(200)
        .json({ post: resp })
    })
    .catch(err => {
      catchError(err, next);
    });
};

exports.deletePost = (req, res, next) => {
  const { params: { postId } } = req;

  Post.findById(postId)
    .then((postDoc) => {
      if (!postDoc) {
        const error = new Error('post not found');
        error.statusCode = 404;
        throw error;
      }
      deleteFile(postDoc.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(() => {
      res
        .status(200)
        .json({ message: 'element deleted' })
    })
    .catch(err => {
      catchError(err, next);
    });
}