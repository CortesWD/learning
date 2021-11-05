/*
 * Dependencies
 */
const { validationResult } = require('express-validator');

/*
 * Models
 */
const Product = require("../models/product");

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
  const { body, user } = req;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product',
      {
        docTitle: 'Add product',
        path: '/admin/add-product',
        editing: false,
        product: body,
        errorMessage: errors.array()[0].msg,
        errors: errors.array(),
      });
  }

  const product = new Product({ ...body, userId: user._id });

  product
    .save()
    .then(res => console.log(res))
    .catch(err => console.log(err))
    .finally(() => res.redirect('/admin/products'));
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
    .catch(err => console.log(err));
};


exports.postEditProduct = (req, res, next) => {
  const {
    body: {
      productId,
      title,
      description,
      price,
      imageUrl,
    }, body } = req;
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
      product.imageUrl = imageUrl;
      return product.save()
        .then(() => res.redirect('/admin/products'))
    })
    .catch(err => console.log(err));
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
    .catch(err => console.log(err))
};

exports.postDeleteProduct = (req, res, next) => {
  const { body: { productId } } = req;

  Product.deleteOne({ _id: productId, userId: req.user._id })
    .then((res) => console.log(res))
    .catch(err => console.log(err))
    .finally(() => {
      res.redirect('/admin/products');
    });
};