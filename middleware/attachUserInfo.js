import db from '../database/sqlite.js'

export default function (req, res, next) {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  if (req.session.user) {
    db.getUserByEmail(req.session.user.email).then((user) => {
        if (user) {
          req.user = user;
          res.locals.isAdmin = req.session.user.role === 'admin';
        } else {
          res.locals.isAdmin = false
        }
        next();
      }).catch((e) => next(new Error(e)));
  } else {
    return next();
  }
}
