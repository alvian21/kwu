"use strict";
const express = require("express");
const router = express.Router();
const output = require("../functions/output");
const getUserByToken = require("../functions/getUserByToken");
const postController = require("../controllers/postController");

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
router.get("/", postController.view);
router.post("/create", postController.create);
router.get("/show/:id", postController.show);
router.put("/update/:id", postController.update);
router.delete("/delete/:id", postController.delete);
router.get("/postdesigner/:id",postController.designerData);
module.exports = router;
