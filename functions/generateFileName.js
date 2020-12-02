const moment = require("moment");
const path = require("path");

module.exports = files => {
  try {
    let fileName = files.name;
    let extension = path.extname(fileName);

    fileName =
      moment().format("YYYYMMDDHms") +
      "" +
      Math.floor(Math.random() * 999999 + 100000) +
      extension;
    return fileName;
  } catch (error) {
    console.log(error);
  }
};
