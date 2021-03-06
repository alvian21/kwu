const async = require("async");
const axios = require("axios");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");
const { Sequelize, Op, Model, DataTypes } = require("sequelize");
const fs = require("fs");
const userModel = require("../models/").User;
const output = require("../functions/output.js");
const missingKey = require("../functions/missingKey");
const generateFileName = require("../functions/generateFileName");
const moveFile = require("../functions/moveFile");
const checkImageExt = require("../functions/checkImageExt");

exports.index = (req, res) => {
  async.waterfall(
    [
      function viewUser(callback) {
        userModel
          .findAll({ where: { id: { [Sequelize.Op.ne]: req.user.id } } })
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

exports.profile = (req, res) => {
  async.waterfall(
    [
      function viewByProfile(callback) {
        const user = req.user;
        userModel
          .findOne({ where: { id: user.id } })
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

exports.detail = (req, res) => {
  async.waterfall(
    [
      function viewById(callback) {
        userModel
          .findOne({ where: { id: req.params.id } })
          .then((res) => {
            if (res) {
              return callback({
                code: "OK",
                data: res,
              });
            }else{
              return callback({
                code: "NOT_FOUND",
                data: "User id not found"
              })
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
