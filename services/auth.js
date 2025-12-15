import { v4 as uuid } from 'uuid'
import db from '../database/sqlite.js'
import { sendEmail } from '../util/email.js'

export function validateLogin (email, password) {
  return db.validateLogin(email, password)
}

export function signup (user) {
  return db.signup(user)
    .then((status) => {
      if (status) {
        sendEmail({
          to: user.email,
          subject: 'Welcome to Web shop',
          html: '<h3>You have successfully signed up.</h3>',
        });
      }
      return status;
    });
};
export function sendResetPasswordToken (email) {
  const token = uuid();

  return db.attachResetPasswordToken(email, token)
    .then(() => {
      sendEmail({
        to: email,
        subject: 'Password reset',
        html: `
        <p>We received your Web shop account password reset request.</p>
        <p>To set a new password, use this <a href="${process.env.DOMAIN}/reset-password/${token}">link</a>.</p>
        <p>If you did not submit a request to change your password, please disregard this message.</p>
      `,
      });
    })
};
export function getUserBySearchParam (param) {
  return db.getUserBySearchParam(param)
}

export function setNewPassword (userId, newPassword, passwordToken) {
  return db.resetPassword(userId, newPassword, passwordToken)
    .then(() => {
      sendEmail({
        to: resetUser.email,
        subject: 'Password reset successful',
        html: `<p>Your Web shop password has been changed.</p>`,
      });
    })
};

export default {
  validateLogin,
  signup,
  sendResetPasswordToken,
  getUserBySearchParam,
  setNewPassword,
};
