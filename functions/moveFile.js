const path = require("path");

module.exports = (files, filename, callback) => {
  files.mv(path.resolve(process.env.CDN + filename), function(err, res) {
    if (err) {
      return callback(err);
    } else {
      return callback(res);
    }
  });
};
