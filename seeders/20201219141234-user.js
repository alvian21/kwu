"use strict";
const crypto = require("crypto");

var mykey = crypto.createCipher("aes-128-cbc", "mypassword");
var mystr = mykey.update("Hello@321", "utf8", "hex");
mystr = mykey.final("hex");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Users", [
      {
        username: "Admin",
        full_name: "Admin",
        email: "admin@gmail.com",
        password: mystr,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  },
};
