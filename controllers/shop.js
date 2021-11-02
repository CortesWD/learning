const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render('shop/product-list', {
        docTitle: 'all products',
        path: '/products',
        products
      });
    })
    .catch(err => console.log(err))
};

exports.getProduct = (req, res, next) => {
  const { params: { productId } } = req;
  // Product.findAll({where: id: productId})
  Product.findById(productId)
    .then((product) => {
      res.render('shop/product-detail', {
        product,
        docTitle: product.title,
        path: '/products',
      })
    })
    .catch(err => console.log(err))
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/index', {
        docTitle: 'Shop',
        path: '/',
        products
      });
    })
    .catch(err => console.log(err))
}

exports.getCart = (req, res, next) => {
  const { user } = req;
  user.getCart()
    .then(products => {
      res.render('shop/cart', {
        docTitle: 'your Cart',
        path: '/cart',
        products
      });
    })
    .catch(err => console.log(err))
}

exports.postCart = (req, res, next) => {
  const { body: { productId }, user } = req;

  Product.findById(productId)
    .then(product =>  user.addToCart(product))
    .catch(err => console.log(err))
    .finally(() => res.redirect('/cart'));
}

exports.postCartDelete = (req, res, next) => {
  const { body: { productId }, user } = req;
  user.deleteItemFromCart(productId)
    .then(res => console.log(res))
    .catch(err => console.err(err))
    .finally(() => res.redirect('/cart'));
}

/* exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    docTitle: 'Checkout',
    path: '/checkout'
  });
} */

exports.getOrders = (req, res, next) => {
  const { user } = req;

  /* include to add the related model in app */
  user.getOrders()
    .then(orders => {
      res.render('shop/orders', {
        docTitle: 'Your Orders',
        path: '/orders',
        orders
      });
    })
    .catch(err => console.log(err))
}

exports.postOrder = (req, res, next) => {
  const { user } = req;

  user.addOrder()
    .then(res => console.log(res))
    .catch(err => console.log(err))
    .finally(() => res.redirect('/orders'));
}
