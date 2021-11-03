const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [{
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: {
        type: Number,
        required: true
      }
    }]
  }
});

userSchema.methods.addToCart = function (product) {

  const cartProductIndex = this.cart.items.findIndex(cp => cp.productId.toString() === product._id.toString());
  const updatedCartItems = [...this.cart.items];

  let newQty = 1;
  if (cartProductIndex >= 0) {
    newQty = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQty;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQty
    });
  }

  const updatedCart = { items: updatedCartItems };

  this.cart = updatedCart;
  return this.save();
}

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());

  this.cart.items = updatedCartItems;
  return this.save();
}

userSchema.methods.clearCart = function() {
  this.cart = {items: []};

  return this.save();
}

module.exports = mongoose.model('User', userSchema);