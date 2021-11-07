/*
 * Dependencies
 */
const express = require('express');

/*
 * Controllers
 */
const feedController = require('../controllers/feed');

const { getPosts, createPost } = feedController;

const router = express.Router();

router.get('/posts', getPosts);
router.post('/post', createPost);


module.exports = router;