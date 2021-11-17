const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const isAuthMw = require('./../middleware/is-auth');

describe('middleware/is-auth', () => {

  it('should throw error if not auth:', () => {
    const req = {
      get: (headerName) => null
    };

    expect(isAuthMw.bind(this, req, {}, () => { }))
      .to.throw('not authenticated.');

  });

  it('should throw error if auth header is only 1 string', () => {
    const req = {
      get: (headerName) => 'xyz'
    };

    expect(isAuthMw.bind(this, req, {}, () => { }))
      .to.throw();
  });

  it('should throw error if token cannot be verified', () => {
    const req = {
      get: (headerName) => 'Bearer xyz'
    };

    expect(isAuthMw.bind(this, req, {}, () => { }))
      .to.throw();
  });

  it('should yield a userId after decoding token', () => {
    const req = {
      get: (headerName) => 'Bearer asdfasdfasdf'
    };

    sinon.stub(jwt, 'verify');

    jwt.verify.returns({ userId: 'abc' });

    isAuthMw(req, {}, () => { });

    expect(req).to.have.property('userId');
    expect(req).to.have.property('userId', 'abc');
    expect(jwt.verify.called).to.be.true;

    jwt.verify.restore();
  });

});