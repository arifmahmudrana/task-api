const validateDate = date => {
  date = new Date(date);
  if (
    Object.prototype.toString.call(date) !== '[object Date]' ||
    isNaN(date.getTime())
  ) {
    return false;
  }

  return true;
};

module.exports = { validateDate };
