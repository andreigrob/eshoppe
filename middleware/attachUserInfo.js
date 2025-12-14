const dbAdapter = require('../database');

module.exports = (req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  if (req.session.user) {
    dbAdapter.getUserBySearchParam({ Email: req.session.user.Email })
      .then((user) => {
        if (user) {
          req.user = user;
          res.locals.isAdmin = req.session.user.Role === 'admin';
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
