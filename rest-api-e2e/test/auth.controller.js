const { expect } = require('chai');
const sinon = require('sinon');

const User = require('./../models/user');
const AuthController = require('./../controllers/auth');


describe('controllers/auth - login process', () => {
  it('should throw error if no connect to DB', (done) => {
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body: {
        email: 'test@test.com',
        password: '123456'
      }
    }

    AuthController.login(req, {}, () => {})
      .then((res) => { 
        expect(res).to.be.an('error');
        expect(res).to.have.property('statusCode', 500);
        //** done is to indicate mocha that this is async and here is completed */
        done();
       });

    User.findOne.restore();
  });

});