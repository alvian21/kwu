const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (function() {
  ac.grant("member")
    .readOwn("profile")
    .readAny("event")
    .readAny("blog");

  ac.grant("admin")
    .extend("member")
    .readAny("event")
    .updateAny("event")
    .deleteAny("event")
    .createOwn("event")
    .updateAny("profile")
    .readAny("profile")
    .deleteAny("profile")
    .readAny("user")
    .updateAny("user")
    .deleteAny("user")
    .readAny("blog")
    .updateAny("blog")
    .deleteAny("blog")
    .createOwn("blog");
  return ac;
})();
