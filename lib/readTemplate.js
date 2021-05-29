const { GENERATED_MESSAGE } = require('./constants');

const CLI_VARIABLE_REGEX = /{_ CLI\[(.*?)]: (.*?) _}/gm;

function parseValue(value) {
  switch (value.toLowerCase().trim()) {
    case "true":
    case "yes":
    case "1":
      return true;
    case "false":
    case "no":
    case "0":
      return false;
    default:
      return value;
  }
}

function readTemplate(script) {
  let scriptBody = script.replace(GENERATED_MESSAGE, '');
  const template = {};
  let match;
  do {
    match = CLI_VARIABLE_REGEX.exec(script);
    if (match) {
      console.log(match[0]);
      scriptBody = scriptBody.replace(match[0], '');
      template[match[1]] = parseValue(match[2]);
    }
  } while (match);

  template.script = scriptBody;//.trim();

  if (template.script === "") {
    template.script = null;
  }
  return template;
}

module.exports = readTemplate;