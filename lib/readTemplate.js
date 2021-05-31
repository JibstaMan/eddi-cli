const getFromConfig = require('./getFromConfig');

const { GENERATED_MESSAGE, CLI_COMMENT_SETTINGS } = require('./constants');

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

function readTemplate(content, script) {
  let templateBody = content.replace(GENERATED_MESSAGE, '');
  const template = {};
  let match;
  do {
    match = CLI_VARIABLE_REGEX.exec(content);
    if (match) {
      const [completeMatch, key, val] = match;
      templateBody = templateBody.replace(completeMatch, '');
      const isReadOnly = getFromConfig(CLI_COMMENT_SETTINGS[key].readOnly, true, [script]);
      if (!isReadOnly) {
        const parsedValue = parseValue(val);
        const isValid = getFromConfig(CLI_COMMENT_SETTINGS[key].validator, true, [parsedValue]);
        if (!isValid) {
          throw new Error(`Template "${script.script}" has an invalid setting: ${CLI_COMMENT_SETTINGS[key].validationMessage}`)
        }
        template[key] = parsedValue;
      }
    }
  } while (match);

  template.script = templateBody.trim();

  if (template.script === "") {
    template.script = null;
  }
  return template;
}

module.exports = readTemplate;