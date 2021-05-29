const { GENERATED_MESSAGE, CLI_COMMENT_WHITELIST } = require('./constants');

const CLI_VARIABLE_REGEX = /{_ CLI\[(.*?)]: (.*?) _}/gm;
const NUMBER_REGEX = /^\d+$/

function parseValue(value) {
  let val = value.toLowerCase().trim();

  if (NUMBER_REGEX.test(val)) {
    return Number(val);
  }

  switch (val) {
    case "true":
    case "yes":
      return true;
    case "false":
    case "no":
      return false;
    case "null":
      return null;
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
      const [completeMatch, key, val] = match;
      scriptBody = scriptBody.replace(completeMatch, '');
      if (CLI_COMMENT_WHITELIST.includes(key)) {
        template[key] = parseValue(val);
      }
    }
  } while (match);

  template.script = scriptBody.trim();

  if (template.script === "") {
    template.script = null;
  }
  return template;
}

module.exports = readTemplate;