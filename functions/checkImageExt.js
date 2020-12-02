module.exports = files => {
  const type = files.mimetype;
  if (type == "image/jpg" || type == "image/png" || type == "image/jpeg") {
    return true;
  } else {
    return false;
  }
};
