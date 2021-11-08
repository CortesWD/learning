/*
 * Dependencies
 */
const express = require('express');
const { body } = require('express-validator');

/*
 * Controllers
 */
const feedController = require('../controllers/feed');

const { getPosts, createPost, getPost } = feedController;

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
}

router.get('/posts', getPosts);
router.post('/post', createPostValidations(), createPost);
router.get('/post/:postId', getPost);


module.exports = router;