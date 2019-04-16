module.exports = (msg, code) => {
  const err = new Error(msg);
  err.status = code;

  return err;
};
