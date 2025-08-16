module.exports = function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const body = {
    success: false,
    message: err.message || 'Internal Server Error'
  };
  if (process.env.NODE_ENV !== 'production') { // only in development
    body.debug = { source: err.source, stack: err.stack };
  }
  res.status(status).json(body);
};
