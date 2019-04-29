const yargonaut = require('yargonaut');
const chalk = yargonaut.chalk();
const fmt = require('util').format;

const showList = (pattern, match, keys) => {
  console.log(chalk.green(fmt(`MATCH ${pattern}`, match)));
  const len = keys.length;
  if (len) {
    for (let i = 0; i < len; i++) {
      console.log(fmt(`%s) "%s"`, i + 1, keys[i]));
    }
  } else {
    console.log('(empty list or set)');
  }
};

module.exports = {
  showList
};
