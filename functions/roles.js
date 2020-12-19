const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (function () {
  ac.grant("member").readOwn("profile").readAny("post");

  ac.grant("designer").readAny("post").createOwn("post");

  ac.grant("admin").readAny("member").readAny("designer");
  return ac;
})();
