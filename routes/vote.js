"use strict";
const express = require("express");
const router = express.Router();
const output = require("../functions/output");
const getUserByToken = require("../functions/getUserByToken");
const voteController = require("../controllers/voteController");

//AUTH MIDDLEWARE
router.use((req, res, next) => {
  if (!req.headers.authorization)
    return output.print(req, res, {
      code: "ERR_ACCESS",
      data: new Error("Not Authorized"),
    });

  getUserByToken(req, res, req.headers.authorization, (err, user) => {
    if (err || !user)
      return output.print(req, res, {
        code: "ERR_ACCESS",
        data: new Error("Not Authorized"),
      });
    else {
      req.user = user;
      next();
    }
  });
});

router.post("/", voteController.create);
module.exports = router;