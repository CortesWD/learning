const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('./../models/user');
const Post = require('./../models/post');
const FeedController = require('./../controllers/feed');


describe('controllers/feed - createPost', () => {
  before((done) => {
    mongoose.connect('mongodb://localhost:27017/test-messages')
      .then(() => {
        const user = new User({
          email: 'utest@test.com',
          name: 'tester',
          password: 'test',
          posts: [],
          _id: '6194577e8ce4486283a3b623'
        });

        return user.save();
      })
      .then(() => done());
  });

  it('should add a post for a valid user', (done) => {

    const req = {
      userId: '6194577e8ce4486283a3b623',
      body: {
        title: 'test title',
        content: 'test content',
      },
      file: {
        path: '/path',
      }
    };

    const res = {
      status: function () {
        return this;
      },
      json: function () {
      }
    };

    FeedController.createPost(req, res, () => { })
      .then(savedUser => {
        expect(savedUser).to.have.property('posts');
        expect(savedUser.posts).to.have.length(1);
        done();
      })

  });

  after((done) => {
    User.deleteMany({})
      .then(() => Post.deleteMany({}))
      .then(() => mongoose.disconnect())
      .then(() => done());
  });

});