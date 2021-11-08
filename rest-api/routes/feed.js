/*
 * Dependencies
 */
const express = require('express');
const { body } = require('express-validator');

/*
 * Controllers
 */
const feedController = require('../controllers/feed');

const {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
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
}

router.get('/posts', getPosts);
router.post('/post', createPostValidations(), createPost);
router.get('/post/:postId', getPost);
router.put('/post/:postId', createPostValidations(), updatePost);
router.delete('/post/:postId', deletePost)


module.exports = router;