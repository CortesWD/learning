const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product',
    {
      docTitle: 'Add product',
      path: '/admin/add-product',
      editing: false
    });
};

exports.postAddProduct = (req, res, next) => {
  const {
    body: {
      title,
      description,
      imageUrl,
      price,
    },
    user
  } = req;

  const product = new Product(
    title,
    price,
    description,
    imageUrl,
    null,
    user._id
  );

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
          product
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
    } } = req;

  const product = new Product(title, price, description, imageUrl, productId);

  product.save()
    .then((res) => {
      console.log('updated', res);
    })
    .catch(err => console.log(err))
    .finally(() => res.redirect('/admin/products'));
}

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
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

  Product.deleteById(productId)
    .then((res) => console.log(res))
    .catch(err => console.log(err))
    .finally(() => {
      res.redirect('/admin/products');
    });
};