/*
 * Dependencies
 */
const { validationResult } = require('express-validator');

/*
 * Models
 */
const Product = require("../models/product");

/*
 * Others
 */
const { catchError } = require('../util/catch-error');
const { deleteFile } = require('../util/file');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product',
    {
      docTitle: 'Add product',
      path: '/admin/add-product',
      editing: false,
      errorMessage: null,
      errors: [],
    });
};

exports.postAddProduct = (req, res, next) => {
  const { body, file: image, user } = req;
  const errors = validationResult(req);

  if (!errors.isEmpty() || !image) {
    const errArray = errors.array();
    return res.status(422).render('admin/edit-product',
      {
        docTitle: 'Add product',
        path: '/admin/add-product',
        editing: false,
        product: body,
        errorMessage: errArray.length ? errArray[0].msg : 'attached file is not an image',
        errors: errArray.length ? errArray : [],
      });
  }

  const product = new Product({
    ...body,
    imageUrl: `/${image.path}`,
    userId: user._id
  });

  product
    .save()
    .then(() => res.redirect('/admin/products'))
    .catch(err => catchError(err, next))
};


exports.getEditProduct = (req, res, next) => {
  const { query: { edit }, params: { productId } } = req;

  if (!edit) { return res.redirect('/'); }

  Product.findById(productId)
    .then((product) => {
      if (!product) { return res.redirect('/'); }

      res.render('admin/edit-product',
        {
          docTitle: 'Edit product',
          path: null,
          editing: edit,
          product,
          errorMessage: null,
          errors: [],
        });
    })
    .catch(err => catchError(err, next));
};


exports.postEditProduct = (req, res, next) => {
  const {
    body: {
      productId,
      title,
      description,
      price,
    },
    body,
    file: image
  } = req;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product',
      {
        docTitle: 'Edit product',
        path: null,
        editing: true,
        product: {
          ...body,
          _id: productId
        },
        errorMessage: errors.array()[0].msg,
        errors: errors.array(),
      });
  }

  Product.findById(productId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) return res.redirect('/');
      product.title = title;
      product.description = description;
      product.price = price;
      if (image) {
        deleteFile(product.imageUrl);
        product.imageUrl = `/${image.path}`;

      }
      return product.save()
        .then(() => res.redirect('/admin/products'))
    })
    .catch(err => catchError(err, next));
}

exports.getProducts = (req, res, next) => {

  Product.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then((products) => {
      res.render('admin/products', {
        products,
        docTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch(err => catchError(err, next))
};

exports.postDeleteProduct = (req, res, next) => {
  const { body: { productId } } = req;

  Product.findById(productId)
    .then(product => {
      if (!product) return next(new Error('no product found'));
      deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: productId, userId: req.user._id })
    })
    .then(() => res.redirect('/admin/products'))
    .catch(err => catchError(err, next))
};

exports.deleteProduct = (req, res, next) => {
  const { params: { productId } } = req;

  Product.findById(productId)
    .then(product => {
      if (!product) return next(new Error('no product found'));
      deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: productId, userId: req.user._id })
    })
    .then(() => {
      res.status(200).json({ message: 'success' });
    })
    .catch(err => {
      res.status(500).json({ message: 'failed' });
    })
}