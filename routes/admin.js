/*
 * Dependencies
 */
const express = require('express');
const { body } = require('express-validator');

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
  postDeleteProduct,
  deleteProduct
} = AdminController;

const router = express.Router();

const productValidation = () => {
  return [
    body('title', 'set a valid title')
      .isLength({ min: 3 })
      .isString()
      .trim(),

    body('price', 'invalid price')
      .isFloat()
      .custom((value, { req }) => {
        if (parseFloat(value) <= 0) throw new Error('cannot be zero')
        return true;
      }),

    body('description', 'needs a description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ]
}

// /admin/add-product => GET
router.get('/add-product', isAuth, getAddProduct);
// /admin/add-product => POST
router.post('/add-product', productValidation(), isAuth, postAddProduct);

router.get('/products', isAuth, getProducts);

router.get('/edit-product/:productId', isAuth, getEditProduct);

router.post('/edit-product', productValidation(), isAuth, postEditProduct);

// router.post('/delete-product', isAuth, postDeleteProduct);
router.delete('/product/:productId', isAuth, deleteProduct);


module.exports = router;
