const async = require("async");
const axios = require("axios");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");
const { Sequelize, Op, Model, DataTypes } = require("sequelize");
const fs = require("fs");
const base64ToImage = require('base64-to-image');
const postModel = require("../models/").Post;
const voteModel = require("../models/").Vote;
const saveModel = require("../models/").Save;
const rateModel = require("../models/").Rate;
const linkModel = require("../models/").Link;
const isBase64 = require('is-base64');
const output = require("../functions/output.js");
const missingKey = require("../functions/missingKey");
const generateFileName = require("../functions/generateFileName");
const moveFile = require("../functions/moveFile");
const checkImageExt = require("../functions/checkImageExt");

exports.viewLink = (req, res) => {
    async.waterfall([
        function view(callback) {
            linkModel.findOne({ where: { designer_id: req.params.id } })
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


exports.createLink = (req, res) => {
    async.waterfall([
        function checkMissingKey(callback) {
            let missingKeys = [];
            missingKeys = missingKey({
                link_skype: req.body.link_skype,
                link_wa: req.body.link_wa,
                link_email: req.body.link_email
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

        function insertToDB(index, callback) {
            const user = req.user;
            linkModel.create({
                designer_id: user.id,
                link_skype: req.body.link_skype,
                link_wa: req.body.link_wa,
                link_email: req.body.link_email
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
                    data: err
                });
            });
        }
    ], (err, result) => {
        if (err) {
            return output.print(req, res, err);
        }
        return output.print(req, res, result);
    })
}