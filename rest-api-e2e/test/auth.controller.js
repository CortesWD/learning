const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('./../models/user');
const AuthController = require('./../controllers/auth');


describe('controllers/auth - login', () => {
  it('should throw error if no connect to DB', (done) => {
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body: {
        email: 'test@test.com',
        password: '123456'
      }
    }

    AuthController.login(req, {}, () => { })
      .then((res) => {
        expect(res).to.be.an('error');
        expect(res).to.have.property('statusCode', 500);
        //** done is to indicate mocha that this is async and here is completed */
        done();
      });

    User.findOne.restore();
  });

});

describe('controllers/auth - getStatus', () => {
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

  it('should send a res status for a valid user', (done) => {

    const req = {
      userId: '6194577e8ce4486283a3b623',
    };

    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      }
    };

    AuthController.getStatus(req, res, () => { })
      .then(() => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.userStatus).to.be.equal('I am new!');
        done();
      });
  });

  after((done) => {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect()
      })
      .then(() => done());
  });
});