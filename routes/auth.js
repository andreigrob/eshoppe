import { Router } from 'express';
import { check, body } from 'express-validator';
import { getLogin, getSignup, postLogin, postSignup, postLogout, getResetPassword, postResetPassword, getNewPassword, postNewPassword } from '../controllers/auth.js';
import { getUserBySearchParam } from '../database/sqlite.js';
import { isValidToken } from '../util/recaptcha.js';

const authRouter = Router();

authRouter.get('/login', getLogin);
authRouter.get('/signup', getSignup);
authRouter.post('/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .normalizeEmail(),
    body('password', 'Password must be valid.').isLength({ min: 8, max: 100 }),
    body('g-recaptcha-response')
    .custom((value, { req }) => {
      return isValidToken(value)
        .then(({ valid, message }) => {
          if (!valid) {
            return Promise.reject(message);
          }
          return true;
        });
    }),
  ],
  postLogin
);
authRouter.post('/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return getUserBySearchParam({ email: value })
          .then((userDoc) => {
            if (userDoc) {
              return Promise.reject('Email already in use.');
            }
          });
      })
      .normalizeEmail(),
    body(
      'password',
      'Please use a password between 8 and 100 characters.'
    ).isLength({ min: 8, max: 100 }),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
    body('g-recaptcha-response')
    .custom((value, { req }) => {
      return isValidToken(value)
        .then(({ valid, message }) => {
          if (!valid) {
            return Promise.reject(message);
          }
          return true;
        });
    })
  ],
  postSignup
);
authRouter.post('/logout', postLogout);
authRouter.get('/reset-password', getResetPassword);
authRouter.post('/reset-password', postResetPassword);
authRouter.get('/reset-password/:token', getNewPassword);
authRouter.post('/new-password', postNewPassword);

export default authRouter;
