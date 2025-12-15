import { Router } from 'express';
import { check, body } from 'express-validator';
import ct from '../controllers/auth.js';
import { getUserBySearchParam } from '../database/sqlite.js';
import { isValidToken } from '../util/recaptcha.js';

const authRouter = Router();

authRouter.get('/login', ct.getLogin);
const loginValidation = [
    body('email').isEmail().withMessage('Please enter a valid email.').normalizeEmail(),
    body('password', 'Password must be valid.').isLength({ min: 8, max: 100 }),
    body('g-recaptcha-response').custom((value) => isValidToken(value).then(({ valid, message }) => valid ? true : Promise.reject(message))),
  ]
authRouter.post('/login', loginValidation, ct.postLogin)

authRouter.get('/signup', ct.getSignup);
const signupValidation = [
    check('email').isEmail().withMessage('Please enter a valid email.').custom((value) => getUserBySearchParam({ email: value })
          .then((userDoc) => userDoc ? Promise.reject('Email already in use.') : true)).normalizeEmail(),
    body('password', 'Please use a password between 8 and 100 characters.').isLength({ min: 8, max: 100 }),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
    body('g-recaptcha-response').custom((value) => isValidToken(value).then(({ valid, message }) => valid ? true : Promise.reject(message)))
  ]
authRouter.post('/signup', signupValidation, ct.postSignup);

authRouter.post('/logout', ct.postLogout);

authRouter.get('/reset-password', ct.getResetPassword);
authRouter.get('/reset-password/:token', ct.getNewPassword);
authRouter.post('/reset-password', ct.postResetPassword);
authRouter.post('/new-password', ct.postNewPassword);

export default authRouter;
