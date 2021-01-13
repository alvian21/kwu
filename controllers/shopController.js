const async = require("async");
const axios = require("axios");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const isBase64 = require("is-base64");
const shopModel = require("../models/").Shop;
const output = require("../functions/output.js");
const missingKey = require("../functions/missingKey");
const generateFileName = require("../functions/generateFileName");
const moveFile = require("../functions/moveFile");
const checkImageExt = require("../functions/checkImageExt");

exports.create = (req, res) => {
  async.waterfall([
    function checkMissingKey(callback) {
      let missingKeys = [];
      missingKeys = missingKey({
        name: req.body.name,
        price: req.body.price,
        shop_link: req.body.shop_link,
        shop_logo: req.body.shop_logo,
        shop_name: req.body.shop_name,
        image: req.body.image
      });

      if (missingKeys.length != 0) {
        return callback({
          code: "MISSING_KEY",
          data: {
            missingKeys
          }
        })
      }
      callback(null, true);
    },

    function base64_decodeImageShopImage(index, callback) {
      const pathFile = Date.now() + ".png";
      const base64Data = req.body.image.replace(
        /^data:image\/png;base64,/,
        ""
      );
      if (isBase64(base64Data)) {
        fs.writeFileSync(
          path.resolve(process.env.CDN + "shop_image/" + pathFile),
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

    function base64_decodeImageShopLogo(index, callback) {
      const pathFile = Date.now() + ".png";
      const base64Data = req.body.shop_logo.replace(
        /^data:image\/png;base64,/,
        ""
      );
      if (isBase64(base64Data)) {
        fs.writeFileSync(
          path.resolve(process.env.CDN + "shop_logo/" + pathFile),
          base64Data,
          "base64",
          function (err) {
            console.log(err);
          }
        );
        req.body.shop_logo = pathFile;
        callback(null, true);
      } else {
        return callback({
          code: "INVALID_REQUEST",
          data: "base64 not valid",
        });
      }
    },

    function insertToDb(index, callback) {
      shopModel.create({
        name: req.body.name,
        price: req.body.price,
        shop_link: req.body.shop_link,
        shop_logo: req.body.shop_logo,
        shop_name: req.body.shop_name,
        image: req.body.image
      }).then(res => {
        if (res) {
          return callback({
            code: "OK",
            data: res
          })
        }
      }).catch(err => {
        return callback({
          code: "ERR_DATABASE",
          dara: err
        })
      })
    }
  ], (err, result) => {
    if (err) {
      return output.print(req, res, err);
    }
    return output.print(req, res, result);
  })
}


exports.view = (req, res) => {
  async.waterfall([
    function viewAllShop(callback) {
      shopModel.findAll({ raw: true })
        .then(res => {
          if (res) {
            return callback({
              code: "OK",
              data: res
            })
          }
        }).catch(err => {
          return callback({
            code: "ERR_DATABASE",
            data: err
          })
        })
    }
  ], (err, result) => {
    if (err) {
      return output.print(req, res, err);
    }
    return output.print(req, res, result);
  })
}


exports.detail = (req, res) => {
  async.waterfall([
    function viewById(callback) {
      shopModel.findOne({ where: { id: req.params.id } })
        .then(res => {
          if (res) {
            return callback({
              code: "OK",
              data: res
            })
          }else{
            return callback({
              code:"NOT_FOUND",
              data:"Shop id not found"
            })
          }
        }).catch(err => {
          return callback({
            code: "ERR_DATABASE",
            data: err
          })
        })
    }
  ], (err, result) => {
    if (err) {
      return output.print(req, res, err);
    }
    return output.print(req, res, result);
  })
}