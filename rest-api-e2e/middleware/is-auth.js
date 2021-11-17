const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : '';
  let decodedToken;
  if (!authHeader) {
    const error = new Error('not authenticated.');
    error.statusCode = 401;
    throw error;
  }

  try {
    decodedToken = jwt.verify(token, 'secret');
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error('not authenticated.');
    error.statusCode = 401;
    throw error;
  }

  req.userId = decodedToken.userId;
  next();
}