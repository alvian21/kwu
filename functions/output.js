const messages = require("../config/messages.json");

exports.print = function(req, res, params) {
  let output = {};
  let message = {};
  if (messages[params.code]) message = messages[params.code];
  output.code = message.code || params.code;
  output.message = params.message || message.message;
  output.data = params.data || message.data;
  output.debug = undefined;

  return res.status(message.status || 200).json(output);
};
