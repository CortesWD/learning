const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : '';
  let decodedToken;
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  try {
    decodedToken = jwt.verify(token, 'secret');
  } catch (err) {
    req.isAuth = false;
    return next();
  }

  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }

  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
}