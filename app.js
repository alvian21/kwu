const environment = require("./app.json").env;

require("env2")(".env." + environment);

const fs = require("fs");
const path = require("path");
const async = require("async");
const express = require("express");
const upload = require("express-fileupload");
const bodyParser = require("body-parser");
const output = require("./functions/output");
const app = express();

app.use(upload());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: process.env.JSON_LIMIT }));
app.use(express.static(path.join(__dirname, "public")));

fs.readdir("./routes", (err, files) => {
  var len = files.length;
  var lenX = len - 1;
  var n = 0;

  files.map((route) => {
    if (route.match(".js")) {
      app.use("/" + route.replace(".js", ""), require("./routes/" + route));

      if (n === lenX) {
        app.use((req, res, next) => {
          return output.print(req, res, {
            code: "SERVICE_NOT_FOUND",
          });
        });

        app.listen(process.env.PORT, "0.0.0.0", () => {
          return console.log(
            process.env.SERVICE_NAME + " start on port " + process.env.PORT
          );
        });
      }
    }

    n++;
  });
});
