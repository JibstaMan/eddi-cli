const path = require('path');
const fs = require('fs/promises');

const { GENERATED_MESSAGE } = require('./constants');

async function scriptToFile(personality, script, folder, { ext, templateSettings, personalityDir }) {
  const filePath = path.join(folder, `${script.name}${ext}`);
  let prefix = '';
  if (templateSettings) {
    prefix = `${GENERATED_MESSAGE}
{_ CLI[personality]: ${personality.name} [read-only] _}
{_ CLI[description]: ${script.description} _}
{_ CLI[enabled]: ${script.enabled} _}
{_ CLI[priority]: ${script.priority} _}

`;
  }

  const content = `${prefix}${script.script || ''}`;
  await fs.writeFile(filePath, content, 'utf-8');
  return { ...script, script: `.\\${path.relative(personalityDir, filePath)}` };
}

module.exports = scriptToFile;
