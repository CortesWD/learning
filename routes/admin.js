/*
 * Dependencies
 */
const path = require('path');
const express = require('express');

/*
 * Controllers
 */
const AdminController = require('../controllers/admin');
const isAuth = require('./../middleware/is-auth');

const {
  getAddProduct,
  postAddProduct,
  getProducts,
  getEditProduct,
  postEditProduct,
  postDeleteProduct
} = AdminController;

const router = express.Router();



// /admin/add-product => GET
router.get('/add-product', isAuth, getAddProduct);
// /admin/add-product => POST
router.post('/add-product', isAuth, postAddProduct);

router.get('/products', isAuth, getProducts);

router.get('/edit-product/:productId', isAuth, getEditProduct);

router.post('/edit-product', isAuth, postEditProduct);

router.post('/delete-product', isAuth, postDeleteProduct);


module.exports = router;
