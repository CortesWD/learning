const Order = require('../models/order');
const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  Product.find()
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
  Product.find()
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
  // Populate from the product ID to fetch all product data
  user.populate('cart.items.productId')
    // .execPopulate() this is not available on mongoose 6
    .then(user => {
      res.render('shop/cart', {
        docTitle: 'your Cart',
        path: '/cart',
        products: user.cart.items
      });
    })
    .catch(err => console.log(err))
}

exports.postCart = (req, res, next) => {
  const { body: { productId }, user } = req;

  Product.findById(productId)
    .then(product => user.addToCart(product))
    .catch(err => console.log(err))
    .finally(() => res.redirect('/cart'));
}

exports.postCartDelete = (req, res, next) => {
  const { body: { productId }, user } = req;
  user.removeFromCart(productId)
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
  Order.find({ 'user.userId': user._id })
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
  const { name, _id } = user;

  user.populate('cart.items.productId')
    .then(user => {
      const order = new Order({
        user: {
          name,
          userId: _id
        },
        products: user.cart.items.map(i => {
          return {
            quantity: i.quantity,
            // _doc returns just the data
            product: { ...i.productId._doc }
          };
        })
      });
      return order.save();
    })
    .then(() => user.clearCart())
    .catch(err => console.log(err))
    .finally(() => res.redirect('/orders'));
}
