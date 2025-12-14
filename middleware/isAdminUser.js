module.exports = (req, res, next) => {
  if (req.session.user && req.session.user.Role === 'admin') {
    return next();
  }
  next(new Error('Not authorized'));
};
