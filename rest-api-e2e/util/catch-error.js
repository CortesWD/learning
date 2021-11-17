exports.catchError = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err)
  return err;
}