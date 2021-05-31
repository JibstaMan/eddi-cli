const path = require('path');
const fs = require('fs/promises');
const getFromConfig = require('./getFromConfig');

const { GENERATED_MESSAGE, CLI_COMMENT_SETTINGS } = require('./constants');

function getTemplateSettings(personality, script) {
  const settings = Object.entries(CLI_COMMENT_SETTINGS).reduce((acc, [key, config]) => {
    const shouldInclude = getFromConfig(config.include, true, [script, personality]);
    if (!shouldInclude) {
      return acc;
    }

    const value = getFromConfig(config.value, script[key], [script, personality]);
    const isReadOnly = getFromConfig(config.readOnly, true, [script, personality]);
    const setting = `{_ CLI[${key}]: ${value} ${isReadOnly ? '[read-only] ' : ''}_}`;
    return `${acc}
${setting}`;
  }, `${GENERATED_MESSAGE}`);

  return `${settings}

`;
}

async function scriptToFile(personality, script, folder, { ext, templateSettings, personalityDir }) {
  const filePath = path.join(folder, `${script.name}${ext}`);
  const prefix = (templateSettings) ? getTemplateSettings(personality, script) : '';

  const content = `${prefix}${script.script || ''}`;
  await fs.writeFile(filePath, content, 'utf-8');
  return { ...script, script: `.\\${path.relative(personalityDir, filePath)}` };
}

module.exports = scriptToFile;
