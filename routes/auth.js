/*
 * Dependencies
 */
const express = require('express');
const router = express.Router();

const {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
  getReset,
  postRest,
  getNewPassword,
  postNewPassword
} = require('../controllers/auth');


router.get('/login', getLogin);
router.get('/signup', getSignup);
router.post('/login', postLogin);
router.post('/signup',postSignup);
router.post('/logout', postLogout);
router.get('/reset', getReset);
router.post('/reset', postRest);
router.get('/reset/:resetToken', getNewPassword);
router.post('/new-password', postNewPassword);

module.exports = router;