const pug = require('pug');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});
const compiledFunctionAccVerify = pug.compileFile(
  __dirname + '/templates/acc-verify.pug'
);
const compiledFunctionResetPassword = pug.compileFile(
  __dirname + '/templates/reset-password.pug'
);

const sendVerificationEmail = (to, url) => {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  transporter.sendMail(
    {
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Verify account',
      text: `Please click this link ${url} to verify your account`,
      html: compiledFunctionAccVerify({ url })
    },
    (err, info) => {
      if (err) console.log('Email send error: ', err);
      else console.log('Email send success info: ', info);
    }
  );
};

const sendResetPasswordEmail = (to, url) => {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  transporter.sendMail(
    {
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Reset password',
      text: `Use this link ${url} to reset your password`,
      html: compiledFunctionResetPassword({ url })
    },
    (err, info) => {
      if (err) console.log('Email send error: ', err);
      else console.log('Email send success info: ', info);
    }
  );
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail
};
