/*
 * Dependencies
 */
const path = require('path');
const express = require('express');

/*
 * Controllers
 */
const shopController = require('../controllers/shop');
const {
  getProducts,
  getIndex,
  getCart,
  getCheckout,
  getOrders,
  getProduct,
  postCart,
  postCartDelete,
  postOrder
} = shopController;

const router = express.Router();

router.get('/', getIndex);

router.get('/products', getProducts);

router.get('/products/:productId', getProduct);

router.get('/cart', getCart);

router.post('/cart', postCart);

router.post('/cart-delete-item', postCartDelete);

// router.get('/checkout', getCheckout);

router.post('/create-order', postOrder);

router.get('/orders', getOrders);



module.exports = router;
