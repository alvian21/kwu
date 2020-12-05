const async = require("async");
const axios = require("axios");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const base64ToImage = require('base64-to-image');
const postModel = require("../models/").Post;
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
                    req.body.image = pathFile;
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