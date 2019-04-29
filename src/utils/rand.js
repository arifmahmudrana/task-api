const crypto = require('crypto');

const randomStringLetters =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-~!@#$%^&*()+={}[]\\|;:\'",<.>/?';

const generateRandomString = (length, letters = '') => {
  if (typeof letters !== 'string' && !letters instanceof String) {
    throw new TypeError('Letter must be a string');
  }

  if (!letters || !letters.length) {
    letters = randomStringLetters;
  }

  if (letters > 256) {
    throw new TypeError(
      `Argument 'letters' should not have more than 256 characters, otherwise unpredictability will be broken`
    );
  }

  const randomBytes = crypto.randomBytes(length),
    result = new Array(length),
    charsLength = letters.length;

  let cursor = 0;
  for (let i = 0; i < length; i++) {
    cursor += randomBytes[i];
    result[i] = letters[cursor % charsLength];
  }

  return result.join('');
};

const generateRandomStringURLSafe = length => {
  return generateRandomString(
    length,
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  );
};

module.exports = {
  randomStringLetters,
  generateRandomString,
  generateRandomStringURLSafe
};
