import { createTransport } from 'nodemailer';
const { EMAIL_HOST, EMAIL_PORT, EMAIL_AUTH_USER, EMAIL_AUTH_PASS, EMAIL_FROM } = process.env;

const transporter = createTransport({
  host: EMAIL_HOST,
  port: parseInt(EMAIL_PORT),
  auth: {
    user: EMAIL_AUTH_USER,
    pass: EMAIL_AUTH_PASS
  }
});

export function sendEmail (options) {
  options.from = EMAIL_FROM
  return transporter.sendMail(options);
}
