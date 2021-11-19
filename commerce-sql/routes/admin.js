/*
 * Dependencies
 */
const path = require('path');
const express = require('express');

/*
 * Controllers
 */
const AdminController = require('../controllers/admin');

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
router.get('/add-product', getAddProduct);
// /admin/add-product => POST
router.post('/add-product', postAddProduct);

router.get('/products', getProducts);

router.get('/edit-product/:productId', getEditProduct);

router.post('/edit-product', postEditProduct);

router.post('/delete-product', postDeleteProduct);


module.exports = router;
