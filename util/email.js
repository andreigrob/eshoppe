import { createTransport } from 'nodemailer';
const { EMAIL_HOST, EMAIL_PORT, EMAIL_AUTH_USER, EMAIL_AUTH_PASS, EMAIL_FROM } = process.env;

const from = EMAIL_FROM
const transporter = createTransport({
  host: EMAIL_HOST,
  port: parseInt(EMAIL_PORT),
  auth: {
    user: EMAIL_AUTH_USER,
    pass: EMAIL_AUTH_PASS
  }
});

export const sendEmail = (options) => {
  const { to, subject, html } = options;

  return transporter.sendMail({ from, to, subject, html });
}

export default {
  sendEmail,
};
