const pug = require('pug');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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

  sgMail.send({
    to,
    from: process.env.EMAIL_FROM,
    subject: 'Verify account',
    text: `Please click this link ${url} to verify your account`,
    html: compiledFunctionAccVerify({ url })
  });
};

const sendResetPasswordEmail = (to, url) => {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  sgMail.send({
    to,
    from: process.env.EMAIL_FROM,
    subject: 'Reset password',
    text: `Use this link ${url} to reset your password`,
    html: compiledFunctionResetPassword({ url })
  });
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail
};
