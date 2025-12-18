import { v4 as uuid } from 'uuid'
import db from '../database/sqlite.js'
import { sendEmail } from '../util/email.js'

export function validateLogin (email, password) {
  return db.validateLogin(email, password)
}

function email (to, subject, html) {
    return sendEmail(to, subject, html)
}

export function signup (user) {
  return db.signup(user).then((status) => {
      if (status) {
        email(user.email, 'Welcome to Web shop','<h3>You have successfully signed up.</h3>')
      }
      return status
    })
}

const domain = process.env.DOMAIN

export function sendResetPasswordToken (email) {
  const token = uuid()
  return db.attachResetPasswordToken(email, token).then(() => {
    return email(email, 'Password reset',
    `<p>We received your Web shop account password reset request.</p>
     <p>To set a new password, use this <a href="${domain}/reset-password/${token}">link</a>.</p>
     <p>If you did not submit a request to change your password, please disregard this message.</p>`)
  })
}

export function getUserBySearchParam (param) {
  return db.getUserBySearchParam(param)
}

export function setNewPassword (user, newPassword, passwordToken) {
  return db.resetPassword(user, newPassword, passwordToken).then(() => {
      return email(user.email, 'Password reset successful', `<p>Your Web shop password has been changed.</p>`)
    })
}

export default {
  validateLogin,
  signup,
  sendResetPasswordToken,
  getUserBySearchParam,
  setNewPassword,
}
