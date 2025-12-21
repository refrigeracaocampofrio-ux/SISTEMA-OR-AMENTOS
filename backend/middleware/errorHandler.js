function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    console.error('[body-parse-error]', {
      message: err.message,
      body: err.body,
      contentType: req.headers['content-type'],
      url: req.originalUrl,
      method: req.method,
    });
  } else {
    console.error(err);
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Erro interno no servidor' });
}

module.exports = { errorHandler };
