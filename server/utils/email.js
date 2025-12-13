// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

module.exports = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: `"RentEasy" <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
      to,
      subject,
      text,
      html
    });
  } catch (err) {
    console.error('Email send error:', err);
  }
};