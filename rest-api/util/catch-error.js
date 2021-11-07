exports.catchError = (httpStatusCode, err, next) => {
  const error = new Error({
    ...err,
    httpStatusCode
  });
  return next(error);
}