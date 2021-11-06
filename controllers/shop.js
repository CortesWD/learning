/*
 * Dependencies
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/*
 * Models
 */
const Order = require('../models/order');
const Product = require("../models/product");
const { catchError } = require('../util/catch-error');

/*
 * Others
 */
const rootDir = require('./../util/path');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('shop/product-list', {
        docTitle: 'all products',
        path: '/products',
        products,
      });
    })
    .catch(err => catchError(err, next))
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
    .catch(err => catchError(err, next))
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
    .catch(err => catchError(err, next))
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
        products: user.cart.items,
      });
    })
    .catch(err => catchError(err, next))
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
    .then(res => res.redirect('/cart'))
    .catch(err => catchError(err, next))
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
        orders,
      });
    })
    .catch(err => catchError(err, next))
}

exports.postOrder = (req, res, next) => {
  const { user } = req;
  const { email, _id } = user;

  user.populate('cart.items.productId')
    .then(user => {
      const order = new Order({
        user: {
          email,
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
    .then(() => {
      user.clearCart();
      res.redirect('/orders');
    })
    .catch(err => catchError(err, next))
}

exports.getInvoice = (req, res, next) => {
  const { params: { orderId } } = req;
  const invoiceName = `invoice-${orderId}.pdf`;
  const invoicePath = path.join(rootDir, 'data', 'invoices', invoiceName);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${invoiceName};`);

  Order.findById(orderId)
    .then(order => {
      if (!order) return next(new Error('no order found'));

      if (order.user.userId.toString() !== req.user._id.toString()) return next(new Error('unauthorized'));
      
      const pdfDoc = new PDFDocument();

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc
        .fontSize(26)
        .text('Invoice', {underline: true});

      pdfDoc.text('------------------------');

      let totalPrice = 0;

      order.products.forEach(prod => {
        const { product, quantity } = prod;
        const { title, price } = product;

        totalPrice += + quantity * price;

        pdfDoc
          .fontSize(16)
          .text(`${title} - ${quantity} x $${price}`);

      });

      pdfDoc.text('------------------------');

      pdfDoc
        .fontSize(20)
        .text(`Total Price: ${totalPrice}`);

      pdfDoc.end();

      //** reading existing files and sending them */
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) return next(err);
      //   res.setHeader('Content-Type', 'application/pdf');
      //   // res.setHeader('Content-Disposition', `inline; filename=${invoiceName};`);
      //   res.setHeader('Content-Disposition', `attachment; filename=${invoiceName};`);
      //   res.send(data);
      // });

      /** Bigger files needs streams to avoid overflow memory */
      // const file = fs.createReadStream(invoicePath);
      // file.pipe(res)
    })
    .catch(err => catchError(err, next));
}
