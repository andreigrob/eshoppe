import { createTransport } from 'nodemailer'

const vars = process.env

const transporter = createTransport({
  host: vars.EMAIL_HOST,
  port: parseInt(vars.EMAIL_PORT),
  auth: {user: vars.EMAIL_AUTH_USER, pass: vars.EMAIL_AUTH_PASS,},
});

export function sendEmail (options) {
  options.from = vars.EMAIL_FROM
  return transporter.sendMail(options);
}
