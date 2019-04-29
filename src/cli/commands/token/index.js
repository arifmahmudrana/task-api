const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();

/*
change command to resource based
client(list(by match), details, create, delete(by match))
token(list(by match), details, create, delete(by match)) --access this will say we only want access tokens --refresh this will tell only want refresh tokens
user list(skip=0, limit=10, filter by id, email, verified), delete(all, by id, by email, by unverified, by verifyTokenexpires duration), show(with task), verify(by id, by email, by unverified, by verifyTokenexpires duration) when delete user delete AWS file & tasks & tokens
task list(skip=0, limit=10, filter by id, done, text, user), delete(all, by id, by done, by text, by user), show(with user) done(all, by id, by done, by text, by user)

2. delete [type] default "token" & "client" if client is 
delete token or client all
delete by id
delete token by expired
delete token or client by match
delete user
delete task
delete user by id
delete user by email
delete user by verified with verifyTokenexpires duration e.g verified false verifyTokenExpires is less then 2 days this can be used to delete unverified account in production
when user delete

delete token/client           //delete all
delete token by expired       //delete expired
delete token/client by id     //delete by matched key
delete token/client by match  //delete by match
Every time we will sent match


delete user
delete task

{ accessToken: '0725ff928fd7409444073f45372ed569716ca9c0',
  accessTokenExpiresAt: 2019-04-27T11:34:07.472Z,
  clientId: 'yK71849MiCDB4cst',
  client:
   { clientId: 'yK71849MiCDB4cst',
     clientSecret: "4$Yt|},oKm6IedoDDqIv'idt<sqt6^*^",
     grants: [ 'password', 'refresh_token' ] },
  refreshToken: '3b892425d02abe4fe4099022b6ed61d6404ca4ef',
  refreshTokenExpiresAt: 2019-04-27T12:04:07.484Z,
  userId: '5cb727a84ecb9f45f5c29ebc',
  user: { id: '5cb727a84ecb9f45f5c29ebc' } }

{ accessToken: '0725ff928fd7409444073f45372ed569716ca9c0',
  accessTokenExpiresAt: '2019-04-27T11:34:07.472Z',
  clientId: 'yK71849MiCDB4cst',
  client:
   { clientId: 'yK71849MiCDB4cst',
     clientSecret: "4$Yt|},oKm6IedoDDqIv'idt<sqt6^*^",
     grants: [ 'password', 'refresh_token' ] },
  refreshToken: '3b892425d02abe4fe4099022b6ed61d6404ca4ef',
  refreshTokenExpiresAt: 2019-04-27T12:04:07.484Z,
  userId: '5cb727a84ecb9f45f5c29ebc',
  user: { id: '5cb727a84ecb9f45f5c29ebc' } }

{ clientId: 'yK71849MiCDB4cst',
  clientSecret: "4$Yt|},oKm6IedoDDqIv'idt<sqt6^*^",
  grants: [ 'password', 'refresh_token' ] } { id: '5cb727a84ecb9f45f5c29ebc' }
  scope undefined

create(creates token & saves takes an userId & clientId)

details(by match)

list(by match) --access this will say we only want access tokens --refresh this will tell only want refresh tokens

delete(by match) --access this will say we only want access tokens --refresh this will tell only want refresh tokens --all will delete all by default it will delete only expired
delete --match="*" --expired  //delete all expired tokens
delete --match="*" --access/--refresh   //delete all access tokens or refresh tokens
delete --match="*"  //delete all tokens
delete --match="*" --access --expired   //delete all expired access tokens
*/
module.exports = {
  command: 'token',
  desc: 'Oauth token commands',
  builder(yargs) {
    yargs
      .command(require('./list'))
      .command(require('./create'))
      .command(require('./show'))
      .command(require('./delete'))
      .demandCommand(
        1,
        chalk.red.bold('You need at least one command before moving on')
      )
      .version(false);
  }
};
