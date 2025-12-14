const dbAdapter = require('../database').default.default;

module.exports = (req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  if (req.session.user) {
    dbAdapter.getUserBySearchParam({ email: req.session.user.email })
      .then((user) => {
        if (user) {
          req.user = user;
          res.locals.isAdmin = req.session.user.role === 'admin';
        } else {
          res.locals.isAdmin = false
        }
        next();
      })
      .catch((err) => {
        next(new Error(err));
      });
  } else {
    next();
  }
};
