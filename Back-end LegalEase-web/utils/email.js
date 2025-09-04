const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT), // make sure it’s a number
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // allow self-signed certs
  }
});
transporter.verify(function(error, success) {
   if (error) {
     console.log('Email transporter error:', error);
   } else {
     console.log('Server is ready to send emails');
   }
});


module.exports = transporter;
