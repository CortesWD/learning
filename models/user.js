const mongodb = require('mongodb');
const { connectToCollection, getDb } = require('../util/database');

const { ObjectId } = mongodb;

const connectToUsers = () => {
  return connectToCollection('users');
}

const connectToProducts = () => {
  return connectToCollection('products');
}
const connectToOrders = () => {
  return connectToCollection('orders');
}

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    return connectToUsers()
      .insertOne(this)
  }

  addToCart(product) {

    const cartProductIndex = this.cart.items.findIndex(cp => cp.productId.toString() === product._id.toString());
    const updatedCartItems = [...this.cart.items];

    let newQty = 1;
    if (cartProductIndex >= 0) {
      newQty = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQty;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQty
      });
    }

    const updatedCart = { items: updatedCartItems };

    return connectToUsers().updateOne({ _id: new ObjectId(this._id) }, {
      $set: {
        cart: updatedCart
      }
    });
  }

  getCart() {
    const productsId = this.cart.items.map(item => item.productId);

    return connectToProducts()
      .find({ _id: { $in: productsId } })
      .toArray()
      .then(products => {
        return products.map(p => {
          return {
            ...p,
            quantity: this.cart.items.find(i => i.productId.toString() === p._id.toString()).quantity,
          }
        });
      })
      .catch(err => console.log(err));
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());

    return connectToUsers().updateOne({ _id: new ObjectId(this._id) }, {
      $set: {
        cart: { items: updatedCartItems }
      }
    });
  }

  addOrder() {
    return this.getCart()
      .then(products => {
        const order = {
          items: products,
          user: {
            _id: new ObjectId(this._id),
            email: this.email,
          }
        };

        return connectToOrders()
          .insertOne(order)
          .then(() => {
            this.cart = { items: [] };
            return connectToUsers().updateOne({ _id: new ObjectId(this._id) }, {
              $set: {
                cart: { items: [] }
              }
            });
          })
          .catch(err => console.log(err));
      });
  }

  getOrders() {
    const db = getDb();
    return db
      .collection('orders')
      .find({ 'user._id': new ObjectId(this._id) })
      .toArray();
  }

  static findById(id) {
    return connectToUsers()
      .findOne({ _id: new ObjectId(id) })
  }
}

module.exports = User;