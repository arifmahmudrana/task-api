const { User } = require('../../models/User');

const list = async (match, skip, limit) => {
  const [totalCount, users] = await Promise.all([
    User.countUserList(match),
    User.userList(match, skip, limit)
  ]);

  return { totalCount, users };
};

const get = async match => {
  const user = await User.findOne(match);

  return user;
};

const verify = async match => {
  const result = await User.verifyMany(match);

  return result;
};

const deleteUser = async (match, skip, limit) => {
  try {
    const users = await User.userList(match, skip, limit);
    await Promise.all(users.map(user => user.remove()));

    return users.length;
  } catch (error) {
    throw error;
  }
};

module.exports = { list, get, verify, delete: deleteUser };
