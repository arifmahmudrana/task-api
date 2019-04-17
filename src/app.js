const OAuthServer = require('express-oauth-server');
const UnauthorizedRequestError = require('oauth2-server/lib/errors/unauthorized-request-error');
const mongoose = require('mongoose');
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}
mongoose.set('useCreateIndex', true);
const express = require('express');
const cors = require('cors');

const port = process.env.PORT || 3000;
const app = express();

const oAuthOptions = {
  model: require('./models/OAuth'),
  useErrorHandler: true
};
if (process.env.NODE_ENV === 'development') {
  oAuthOptions.accessTokenLifetime =
    parseInt(process.env.ACCESS_TOKEN_LIFETIME, 10) || 300;
  oAuthOptions.refreshTokenLifetime =
    parseInt(process.env.REFRESH_TOKEN_LIFETIME, 10) || 600;
  oAuthOptions.debug = true;
}
app.oauth = new OAuthServer(oAuthOptions);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const auth = require('./routes/auth');
const user = require('./routes/user');

app.use('/api/v1', auth);
app.post('/oauth/token', app.oauth.token());
app.use('/api/v1', app.oauth.authenticate(), user);

app.use((req, res, next) => {
  next(require('./utils/err')('Not Found', 404));
});

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('====================================');
    console.log(err);
    console.log('====================================');
  }

  res.status(err.status || 500);

  if (err instanceof UnauthorizedRequestError) {
    return res.send();
  }

  res.json({
    error: err.message
  });
});

mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    if (!module.parent) {
      const server = app.listen(port, () => {
        const addr = server.address();
        const bind =
          typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
        console.log('Listening on ' + bind);
      });
    }
  })
  .catch(err => {
    throw err;
  });

module.exports = app;
