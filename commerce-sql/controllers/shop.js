const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  Product.findAll()
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
  Product.findByPk(productId)
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
  Product.findAll()
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
    .then(cart => cart.getProducts())
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
  let fetchedCart;
  let newQty = 1;
  user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: productId } })
    })
    .then(([product]) => {
      if (product) {
        const oldQty = product.cartItem.quantity;
        newQty = oldQty + 1;
        return product;
      }
      return Product.findByPk(productId)
    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQty }
      });
    })
    .catch(err => console.log(err))
    .finally(() => res.redirect('/cart'));
}

exports.postCartDelete = (req, res, next) => {
  const { body: { productId }, user } = req;
  user.getCart()
    .then(cart => cart.getProducts({ where: { id: productId } }))
    .then(([product]) => product.cartItem.destroy())
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
  user.getOrders({include: ['products']})
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
  let fetchedCart;

  user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      user.createOrder()
        .then(order => {
          return order.addProducts(products.map((product) => {
            product.orderItem = {
              quantity: product.cartItem.quantity
            }
            return product;
          }))
            .catch(err => console.log(err))
        })
    })
    .then(res => fetchedCart.setProducts(null))
    .catch(err => console.log(err))
    .finally(() => res.redirect('/orders'));
}
