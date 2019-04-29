const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();
const fmt = require('util').format;

const OAuth = require('../../../models/OAuth');

const showToken = async (
  token,
  refresh = false,
  showError = true,
  hideSaveMessage = false
) => {
  let data;
  if (refresh) {
    data = await OAuth.getRefreshToken(token);
  } else {
    data = await OAuth.getAccessToken(token);
  }

  if (!data) {
    if (showError) {
      throw new Error(fmt(`Token couldn't retrieve from store: %s`, token));
    } else {
      console.log('(nil)');
      return;
    }
  }

  if (!hideSaveMessage) {
    console.log(chalk.green(fmt(`Token saved for User ID: %s`, data.userId)));
  }
  console.log(fmt(`Client ID: "%s"`, data.clientId));
  console.log(fmt(`Client Secret: "%s"`, data.client.clientSecret));
  console.log(fmt(`Access Token: "%s"`, data.accessToken));
  console.log(fmt(`Access Token Expires: %s`, data.accessTokenExpiresAt));
  console.log(fmt(`Refresh Token: "%s"`, data.refreshToken));
  console.log(fmt(`Refresh Token Expires: %s`, data.refreshTokenExpiresAt));
};

module.exports = {
  showToken
};
