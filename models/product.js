const mongodb = require('mongodb');
const { connectToCollection } = require('../util/database');

const { ObjectId } = mongodb;

const connectToProducts = () => {
  return connectToCollection('products');
}
class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new ObjectId(id) : null;
    this.userId = userId;
  }

  save() {

    const operation = this._id
      // Update Product
      ? connectToProducts().updateOne({ _id: this._id }, { $set: this })
      // create Product
      : connectToProducts().insertOne(this);

    return operation
      .then(res => console.log('saved', res))
      .catch(err => console.log('err saved', err));
  }

  static fetchAll() {
    return connectToProducts().find().toArray()
      .then(products => products)
      .catch(err => console.log(err))
  }

  static findById(id) {
    return connectToProducts()
      .find({ _id: new mongodb.ObjectId(id) })
      .next()
      .then(product => product)
      .catch(err => err);
  }

  static deleteById(id) {
    return connectToProducts()
      .deleteOne({_id: new mongodb.ObjectId(id)})
      .then(res => res)
      .catch(err => console.log(err));
  }
}

module.exports = Product;