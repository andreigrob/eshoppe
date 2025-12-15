export default function (req, res, next) {
  return req.session.isLoggedIn ? next() : res.redirect('/login')
}
