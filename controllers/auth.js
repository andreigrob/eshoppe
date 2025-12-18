import { validationResult } from 'express-validator'
import { catchFunc } from './common.js'
import auth from '../services/auth.js'

const empty = []
const emptyLogin = {email: '', password: '',}
const emptySignup = {email: '', password: '', confirmPassword: '',}
const key = process.env.RECAPTCHA_SITE_KEY

function getLogin (req, res) {
  const message = req.flash('error')
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Log In',
    errorMessage: message[0],
    oldInput: emptyLogin,
    recaptchaSiteKey: key,
    validationErrors: empty,
  })
}

function getSignup (req, res) {
  const message = req.flash('error')
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Sign Up',
    errorMessage: message[0],
    oldInput: emptySignup,
    recaptchaSiteKey: key,
    validationErrors: empty,
  })
}

function postLogin (req, res, _next) {
  const l = req.body
  function errorRes (errorMessage, validationErrors) {
    res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Log In',
      errorMessage,
      oldInput: {email: l.email, password: l.password,},
      recaptchaSiteKey: key,
      validationErrors,
    })
  }
  const errors = validationResult(req)
  if (errors && !errors.isEmpty()) {
    return errorRes(errors.array()[0].msg, errors.array())
  }
  return auth.validateLogin(l.email, l.password).then((args) => {
      if (!args.match) {
        return errorRes('Invalid email or password.', empty) 
      }
      req.session.isLoggedIn = true
      req.session.user = args.user
      return req.session.save((e, _r) => {
        if (e) {
          console.log(e)
        }
        return res.redirect('/')
      })
    }).catch((e) => {
      console.log(e)
      res.redirect('/login')
    })
}

function postSignup (req, res, next) {
  const l = req.body
  const errors = validationResult(req)
  if (errors && !errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Sign Up',
      errorMessage: errors.array()[0].msg,
      oldInput: {email: l.email, password: l.password, confirmPassword: l.confirmPassword,},
      recaptchaSiteKey: key,
      validationErrors: errors.array(),
    })
  }
  return auth.signup({email: l.email, password: l.password}).then((status) => {
      if (!status) {
        throw new Error("Failed to signup")
      }
      return res.redirect('/login')
    }).catch(catchFunc(next))
}

function postLogout (req, res) {
  return req.session.destroy((e) => {
    if (e) {
      console.log(err)
    }
    return res.redirect('/')
  })
}

function getResetPassword (req, res) {
  const message = req.flash('error')
  return res.render('auth/reset-password', {path: '/reset-password', pageTitle: 'Reset Password', errorMessage: message[0],})
}

function postResetPassword (req, res, next) {
  return auth.sendResetPasswordToken(req.body.email).then(() => res.redirect('/')).catch(catchFunc(e, next))
}

function getNewPassword (req, res, next) {
  return auth.getUserBySearchParam({resetToken: token,}).then((user) => {
      if (!user) {
        req.flash('error', 'Invalid password reset link. To reset your password, submit a new request.')
        return res.redirect('/login')
      }
      const message = req.flash('error');
      return res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message[0],
        userId: user.id.toString(),
        passwordToken: req.params.token,
      })
    }).catch(catchFunc(next))
}

function postNewPassword (req, res, next) {
  const l = req.body.password
  return auth.setNewPassword(l.userId, l.newPassword, l.passwordToken).then(() => res.redirect('/login')).catch(catchFunc(e, next))
}

export default {
  getLogin,
  getSignup,
  postLogin,
  postSignup,
  postLogout,
  getResetPassword,
  postResetPassword,
  getNewPassword,
  postNewPassword,
}
