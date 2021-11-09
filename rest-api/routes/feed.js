/*
 * Dependencies
 */
const express = require('express');
const { body } = require('express-validator');

/*
 * Controllers
 */
const feedController = require('../controllers/feed');

/*
 * Middleware
 */
const isAuth = require('./../middleware/is-auth');

const {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost
} = feedController;

const router = express.Router();

const createPostValidations = () => {
  return [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 }),
  ]
};

router.get('/posts', isAuth, getPosts);
router.post('/post', isAuth, createPostValidations(), createPost);
router.get('/post/:postId', isAuth, getPost);
router.put('/post/:postId', isAuth, createPostValidations(), updatePost);
router.delete('/post/:postId', isAuth, deletePost)

module.exports = router;