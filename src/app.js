const OAuthServer = require('express-oauth-server');
const UnauthorizedRequestError = require('oauth2-server/lib/errors/unauthorized-request-error');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const express = require('express');
const cors = require('cors');
const paginate = require('express-paginate');
const compression = require('compression');

require('./db/mongoose');

const port = process.env.PORT || 3000;
const app = express();
app.enable('trust proxy');

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
app.use(compression()); // compress all responses
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const limiter = rateLimit({
  store: new RedisStore({
    client: require('./redis/db')
  })
});
//  apply to all requests
app.use(limiter);

const userMiddlewares = require('./middlewares/user');

app.use(paginate.middleware());
app.use('/api/v1', require('./routes/auth'));
app.post('/oauth/token', app.oauth.token());

app.use(
  '/api/v1/me',
  app.oauth.authenticate(),
  userMiddlewares.findById,
  require('./routes/user')
);
app.use(
  '/api/v1/tasks',
  app.oauth.authenticate(),
  userMiddlewares.findById,
  require('./routes/task')
);

app.use((req, res, next) => {
  next(require('./utils/err')('Not Found', 404));
});

app.use((err, req, res, next) => {
  err.status = err.code || err.status || 500;
  if (process.env.NODE_ENV === 'development') {
    console.log('====================================');
    console.log(err);
    console.log('====================================');
  }

  res.status(err.status);

  if (err instanceof UnauthorizedRequestError || err.status === 401) {
    return res.send();
  }

  res.json({
    error: err.message
  });
});

if (!module.parent) {
  const server = app.listen(port, () => {
    const addr = server.address();
    const bind =
      typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
  });
}

module.exports = app;
