module.exports = fields => {
  const missingKeys = [];
  Object.keys(fields).forEach(key => {
    if (!Array.isArray(fields[key])) {
      if (!fields[key] || Object.keys(fields[key]).length === 0)
        missingKeys.push(key);
    } else {
      let isFalsy = true;
      fields[key].forEach(item => {
        if (item) {
          isFalsy = false;
        }
      });
      if (isFalsy) missingKeys.push(key);
    }
  });
  return missingKeys;
};
