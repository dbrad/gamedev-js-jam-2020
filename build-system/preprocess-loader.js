const getOptions = require("loader-utils").getOptions;
const preprocess = require("preprocess").preprocess;

module.exports = function(source) {
  const options = getOptions(this);
  let context = {};
  if (options && options.DEBUG) {
    context.DEBUG = true;
  }
  return preprocess(source, context, { type: "js" });
};
