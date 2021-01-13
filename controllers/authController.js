const async = require("async");
const axios = require("axios");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const isBase64 = require("is-base64");
const userModel = require("../models/").User;
const output = require("../functions/output.js");
const missingKey = require("../functions/missingKey");
const generateFileName = require("../functions/generateFileName");
const moveFile = require("../functions/moveFile");
const checkImageExt = require("../functions/checkImageExt");

exports.signUp = (req, res) => {
  async.waterfall(
    [
      function checkMissingKey(callback) {
        let missingKeys = [];
        missingKeys = missingKey({
          full_name: req.body.full_name,
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          role: req.body.role,
          image: req.body.image,
        });

        if (missingKeys.length !== 0) {
          return callback({
            code: "MISSING_KEY",
            data: {
              missingKeys,
            },
          });
        }
        callback(null, true);
      },

      function validation(index, callback) {
        // Validation password
        const passwordRegx = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
        const password = req.body.password;

        if (!password.match(passwordRegx)) {
          return callback({
            code: "INVALID_REQUEST",
            data:
              "Password invalid, must be containing lowercase, uppercase, number, mixed char and 8 char",
          });
        }

        // Email validation
        const emailRegx = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        const email = req.body.email;

        if (!email.match(emailRegx)) {
          return callback({
            code: "INVALID_REQUEST",
            data: "Email invalid",
          });
        }

        callback(null, true);
      },

      function checkUsername(index, callback) {
        userModel
          .findOne({
            where: {
              username: req.body.username,
            },
          })
          .then((res) => {
            if (res) {
              return callback({
                code: "FOUND",
                data: "Username already taken",
              });
            }
            callback(null, true);
          })
          .catch((err) => {
            return callback({
              code: "ERR_DATABASE",
              data: err,
            });
          });
      },
      function checkEmail(index, callback) {
        userModel
          .findOne({
            where: {
              email: req.body.email,
            },
          })
          .then((res) => {
            if (res) {
              return callback({
                code: "FOUND",
                data: "Email alredy taken",
              });
            }
            callback(null, true);
          })
          .catch((err) => {
            return callback({
              code: "ERR_DATABASE",
              data: err,
            });
          });
      },

      function hashPassword(index, callback) {
        try {
          var mykey = crypto.createCipher("aes-128-cbc", "mypassword");
          var mystr = mykey.update(req.body.password, "utf8", "hex");
          mystr += mykey.final("hex");
          req.body.password = mystr;
          callback(null, true);
        } catch (err) {
          return callback({
            code: "GENERAL_ERR",
            data: err,
          });
        }
      },

      function base64_decodeImage(index, callback) {
        const pathFile = Date.now() + ".png";
        const base64Data = req.body.image.replace(
          /^data:image\/png;base64,/,
          ""
        );
        if (isBase64(base64Data)) {
          fs.writeFileSync(
            path.resolve(process.env.CDN + "user/" + pathFile),
            base64Data,
            "base64",
            function (err) {
              console.log(err);
            }
          );
          req.body.image = pathFile;
          callback(null, true);
        } else {
          return callback({
            code: "INVALID_REQUEST",
            data: "base64 not valid",
          });
        }
      },

      function insert(index, callback) {
        userModel
          .create({
            full_name: req.body.full_name,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
            image: req.body.image,
          })
          .then((res) => {
            if (res) {
              return callback({
                code: "OK",
                data: res,
              });
            }
          })
          .catch((err) => {
            return callback({
              code: "ERR_DATABASE",
              data: err,
            });
          });
      },
    ],
    (err, result) => {
      if (err) {
        return output.print(req, res, err);
      }
      return output.print(req, res, result);
    }
  );
};

exports.signInDB = (req, res) => {
  async.waterfall(
    [
      function checkMissingKey(callback) {
        let missingKeys = [];
        missingKeys = missingKey({
          email: req.body.email,
          password: req.body.password,
        });
        if (missingKeys.length !== 0) {
          return callback({
            code: "MISSING_KEY",
            data: {
              missingKeys,
            },
          });
        }
        callback(null, true);
      },

      function checkUserType(index, callback) {
        userModel
          .findOne({
            where: {
              email: req.body.email,
            },
          })
          .then((res) => {
            if (!res) {
              return callback({
                code: "NOT_FOUND",
                data: "User invalid",
              });
            }

            callback(null, res);
          })
          .catch((err) => {
            return callback({
              code: "ERR_DATABASE",
              data: err,
            });
          });
      },

      function checkPassword(user, callback) {
        var mykey = crypto.createDecipher("aes-128-cbc", "mypassword");
        var mystr = mykey.update(user.password, "hex", "utf8");
        mystr += mykey.final("utf8");

        if (mystr !== req.body.password) {
          return callback({
            code: "INVALID_REQUEST",
            data: "Password wrong",
          });
        }
        callback(null, user);
      },

      function generateToken(user, callback) {
        jwt.sign(
          { user: user.email, password: user.password },
          "secret",
          {
            algorithm: "HS256",
          },
          (err, token) => {
            if (err) {
              return callback({
                code: "GENRAL_ERR",
                data: err,
              });
            }

            callback(null, token);
          }
        );
      },

      function insertTokenToDb(token, callback) {
        userModel
          .update(
            {
              token: token,
            },
            {
              where: {
                email: req.body.email,
              },
            }
          )
          .then((res) => {
            return callback(null, {
              code: "OK",
              data: {
                token: token,
              },
            });
          })
          .catch((err) => {
            return callback({
              code: "ERR_DATABASE",
              data: err,
            });
          });
      },
    ],
    (err, result) => {
      if (err) {
        return output.print(req, res, err);
      }
      return output.print(req, res, result);
    }
  );
};
