"use strict";
const express = require("express");
const router = express.Router();
const output = require("../functions/output");
const getUserByToken = require("../functions/getUserByToken");
const userController = require("../controllers/userController");
const rolesController = require("../controllers/rolesController");

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

router.get("/profile", userController.profile);

router.get("/detail/:id", userController.detail);

router.get(
  "/",
  rolesController.grantAccess("readAny", "designer"),
  userController.index
);
router.get(
  "/",
  rolesController.grantAccess("readAny", "member"),
  userController.index
);
module.exports = router;
