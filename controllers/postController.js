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
const isBase64 = require('is-base64');
const output = require("../functions/output.js");
const missingKey = require("../functions/missingKey");
const generateFileName = require("../functions/generateFileName");
const moveFile = require("../functions/moveFile");
const checkImageExt = require("../functions/checkImageExt");

exports.create = (req, res) => {
    async.waterfall([

        function checkMisingKey(callback) {
            let missingKeys = [];
            missingKeys = missingKey({
                name: req.body.name,
                category: req.body.category,
                description: req.body.description,
                image: req.body.image
            });

            if (missingKeys.length !== 0) {
                return callback({
                    code: "MISSING_KEY",
                    data: {
                        missingKeys
                    }
                })
            }
            callback(null, true);
        },

        function base64_decodeImage(index, callback) {
            const pathFile = Date.now() + ".png";
            const base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
            if (isBase64(base64Data)) {
                fs.writeFileSync(path.resolve(process.env.CDN + "post/" + pathFile), base64Data, 'base64', function (err) {
                    console.log(err)
                });
                req.body.image = pathFile;
                callback(null, true);
            } else {
                return callback({
                    code: "INVALID_REQUEST",
                    data: "base64 not valid"
                })
            }

        },

        function insert(index, callback) {
            const user = req.user;
            postModel.create({
                user_id: user.id,
                name: req.body.name,
                category: req.body.category,
                description: req.body.description,
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
        function viewData(callback) {
            postModel.findAll({ raw: true })
                .then(res => {
                    if (res) {
                        callback(null, res);
                    }
                }).catch(err => {
                    return callback({
                        code: "ERR_DATABASE",
                        data: err
                    });
                });
        },

        function getCountVote(res, callback) {
            voteModel.findAll({
                group: ['post_id'],
                attributes: ['post_id', [Sequelize.fn('COUNT', 'post_id'), 'votecount']],
            }).then(function (datavote) {
                callback(null, res, datavote);
            }).catch(err => {
                return callback({
                    code: "ERR_DATABASE",
                    data: err
                });
            });
        },

        function getCountSave(res, datavote, callback) {
            saveModel.findAll({
                group: ['post_id'],
                attributes: ['post_id', [Sequelize.fn('COUNT', 'post_id'), 'savecount']],
            }).then(function (datasave) {
                callback(null, res, datavote, datasave);
            }).catch(err => {
                return callback({
                    code: "ERR_DATABASE",
                    data: err
                });
            });
        },

        function getAvgRate(res, datavote, datasave, callback) {
            rateModel.findAll({
                group: ['post_id'],
                attributes: ['post_id', [Sequelize.fn('avg', Sequelize.col('data')), 'avgrate']]
            }).then(function (datarate) {
                callback(null, res, datavote, datasave, datarate);
            }).catch(err => {
                return callback({
                    code: "ERR_DATABASE",
                    data: err
                })
            })
        },

        function pushtoArray(res, datavote, datasave, datarate, callback) {
            const dataArray = [];

            res.map((data, index) => {
                var getcountvote = 0;
                var getcountsave = 0;
                var getavgrate = 0;
                datavote.map((datacount, indexcount) => {
                    const countvotegrup = datacount.dataValues;
                    if (countvotegrup.post_id == data.id) {
                        getcountvote = countvotegrup.votecount;
                    }
                });

                datasave.map((valuesave, indexsave) => {
                    const countsavegroup = valuesave.dataValues;
                    if (countsavegroup.post_id == data.id) {
                        getcountsave = countsavegroup.savecount;
                    }
                });

                datarate.map((valuerate, indexrate) => {
                    const avgrategroup = valuerate.dataValues;
                    if (avgrategroup.post_id == data.id) {
                        getavgrate = avgrategroup.avgrate;
                    }
                });

                const result = {
                    id: data.id,
                    user_id: data.user_id,
                    name: data.name,
                    category: data.category,
                    image: data.image,
                    description: data.description,
                    vote: getcountvote,
                    saved: getcountsave,
                    rate: getavgrate,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                };
                dataArray.push(result);
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

exports.show = (req, res) => {
    async.waterfall([
        function viewDatabyId(callback) {
            postModel.findOne({ where: { id: req.params.id } })
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

exports.update = (req, res) => {
    async.waterfall([
        function checkMissingKey(callback) {
            let missingKeys = [];
            missingKeys = missingKey({
                name: req.body.name,
                category: req.body.category,
                description: req.body.description
            });

            if (missingKeys.length !== 0) {
                return callback({
                    code: "MISSING_KEY",
                    data: {
                        missingKeys
                    }
                })
            }
            callback(null, true);
        },
        function checkIdPost(index, callback) {
            postModel.findOne({ where: { id: req.params.id } })
                .then(res => {
                    if (res) {
                        req.body.oldImage = res.image;
                        callback(null, true);
                    } else {
                        return callback({
                            code: "NOT_FOUND",
                            data: "post not found"
                        })
                    }
                }).catch(err => {
                    return callback({
                        code: "ERR_DATABASE",
                        data: err
                    });
                });
        },

        function checkIfReqImg(index, callback) {
            if (req.body.image) {
                const pathFile = Date.now() + ".png";
                const base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
                if (isBase64(base64Data)) {
                    //save image to folder
                    fs.writeFileSync(path.resolve(process.env.CDN + "post/" + pathFile), base64Data, 'base64', function (err) {
                        console.log(err)
                    });
                    //remove old image
                    fs.unlinkSync(path.resolve(process.env.CDN + "post/" + req.body.oldImage), (err) => {
                        if (!err) {
                            req.body.image = pathFile;
                            callback(null, true);
                        }
                    })
                } else {
                    return callback({
                        code: "INVALID_REQUEST",
                        data: "base64 not valid"
                    })
                }
            } else {
                callback(null, true);
            }
        },

        function updateToDB(index, callback) {
            if (req.body, image) {
                postModel.update({
                    name: req.body.name,
                    category: req.body.category,
                    description: req.body.description
                }, { where: { id: req.params.id } })
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
                        });
                    });
            }
        }
    ], (err, result) => {
        if (err) {
            return output.print(req, res, err);
        }
        return output.print(req, res, result);
    })
}


exports.delete = (req, res) => {
    async.waterfall([
        function checkIdPost(callback) {
            postModel.findOne({
                where: {
                    id: req.params.id
                }
            }).then(res => {
                if (res) {
                    req.body.image = res.image;
                    callback(null, true);
                } else {
                    return callback({
                        code: "NOT_FOUND",
                        data: "Post not found"
                    })
                }
            }).catch(err => {
                return callback({
                    code: "ERR_DATABASE",
                    data: err
                });
            });
        },

        function deleteImagebyId(index, callback) {
            fs.unlinkSync(path.resolve(process.env.CDN + "post/" + req.body.image), (err) => {
                if (!err) {
                    callback(null, true);
                }
            })
        },

        function deletePostbyId(index, callback) {
            postModel.destroy({
                where: { id: req.params.id }
            }).then(res => {
                if (res) {
                    return callback({
                        code: "OK",
                        data: "post has been deleted"
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