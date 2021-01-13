const async = require("async");
const axios = require("axios");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const isBase64 = require("is-base64");
const orderModel = require("../models/").Order;
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
                designer_id: req.body.designer_id,
                data: req.body.data
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

        function CheckDesignerid(index, callback) {
            orderModel.findOne({ where: { designer_id: req.body.designer_id } })
                .then(res => {
                    var status_id = false;
                    if (res) {
                        status_id = true;
                    }

                    callback(null, status_id);
                }).catch(err => {
                    return callback({
                        code: "ERR_DATABASE",
                        data: err
                    })
                })
        },

        function insertOrUpdate(status_id, callback) {
         
            if (status_id) {
                orderModel.update({
                    data: req.body.data
                }, { where: { designer_id: req.body.designer_id } })
                    .then(res => {
                        return callback({
                            code: "OK",
                            data: "Order has been updated"
                        })
                    }).catch(err => {
                        return callback({
                            code: "ERR_DATABASE",
                            data: err
                        })
                    })
            } else {
                orderModel.create({
                    designer_id: req.body.designer_id,
                    data: req.body.data
                }).then(res => {
                    return callback({
                        code: "OK",
                        data: res
                    })
                }).catch(err => {
                    return callback({
                        code: "ERR_DATABASE",
                        data: err
                    })
                })
            }
        }
    ], (err, result) => {
        if (err) {
            return output.print(req, res, err);
        }
        return output.print(req, res, result);
    })
}