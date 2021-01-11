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

exports.create = (req, res) => {
    async.waterfall([
        function checkMissingKey(callback) {
            let missingKeys = [];
            missingKeys = missingKey({
                post_id: req.body.post_id,
                designer_id: req.body.designer_id
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
            saveModel.create({
                user_id: user.id,
                post_id: req.body.post_id,
                designer_id: req.body.designer_id
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

exports.view = (req, res) => {
    async.waterfall([
        function getDataSave(callback) {
            const user = req.user;
            saveModel.findAll({ where: { user_id: user.id } })
                .then(res => {
                    callback(null, res);
                }).catch(err => {
                    return callback({
                        code: "ERR_DATABASE",
                        data: err
                    })
                })

        },

        function getPost(res, callback) {
            postModel.findAll({ raw: true })
                .then(datapost => {
                    callback(null, res, datapost);
                }).catch(err => {
                    return callback({
                        code: "ERR_DATABASE",
                        data: err
                    })
                })
        },

        function getSavePostByid(res, datapost, callback) {
            const dataArray = [];
            datapost.map(datavalue => {
                res.map(datares => {
                    if (datavalue.id === datares.post_id) {
                        const result = {
                            id: datavalue.id,
                            user_id: datavalue.user_id,
                            name: datavalue.name,
                            category: datavalue.category,
                            image: datavalue.image,
                            description: datavalue.description,
                            createdAt: datavalue.createdAt,
                            updatedAt: datavalue.updatedAt
                        };
                        dataArray.push(result);
                    }
                })
            });

            return callback({
                code: "OK",
                data: dataArray
            })
        }

    ], (err, result) => {
        if (err) {
            return output.print(req, res, err);
        }
        return output.print(req, res, result);
    })
}