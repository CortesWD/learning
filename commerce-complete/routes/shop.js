/*
 * Dependencies
 */
const path = require('path');
const express = require('express');

/*
 * Controllers
 */
const shopController = require('../controllers/shop');
const isAuth = require('./../middleware/is-auth');

const {
  getProducts,
  getIndex,
  getCart,
  getCheckout,
  getOrders,
  getProduct,
  postCart,
  postCartDelete,
  getCheckoutSuccess,
  getInvoice,
} = shopController;

const router = express.Router();

router.get('/', getIndex);

router.get('/products', getProducts);

router.get('/products/:productId', getProduct);

router.get('/cart', isAuth, getCart);

router.post('/cart', isAuth, postCart);

router.post('/cart-delete-item', isAuth, postCartDelete);

router.get('/checkout', isAuth, getCheckout);

router.get('/checkout/success', isAuth, getCheckoutSuccess);

router.get('/checkout/cancel', isAuth, getCheckout);

// router.post('/create-order', isAuth, postOrder);

router.get('/orders', isAuth, getOrders);

router.get('/orders/:orderId', isAuth, getInvoice);
router.get('/orders/:orderId', isAuth, getInvoice);

module.exports = router;
