export default function (req, _res, next) {
  return req.session.user && req.session.user.role === 'admin' ? next() : next(new Error('Not authorized'))
}