const path = require('path');
const fs = require('fs/promises');
const writeJson = require('./writeJson');

const { PERSONALITY_FILENAME, GENERATED_MESSAGE } = require('./constants');

function normalizeExt(ext) {
  return `.${ext}`.replace('..', '.');
}

async function scriptToFile(personality, script, folder, { ext, templateSettings }) {
  const filePath = path.join(folder, `${script.name}${normalizeExt(ext)}`);
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
  return { ...script, script: `./${path.relative(folder, filePath)}` };
}

async function personalityToFiles(personality, options) {
  if (!personality) {
    return;
  }

  const personalityDir = path.join(process.cwd(), personality.name);
  const backupDir = path.join(personalityDir, 'backup');
  await fs.mkdir(personalityDir);
  await fs.mkdir(backupDir);

  await fs.copyFile(personality.filePath, path.join(backupDir, path.basename(personality.filePath)));

  const scripts = await Promise.all(
    Object.entries(personality.scripts).map(([key, script]) => {
      return scriptToFile(personality, script, personalityDir, options)
        .then((updatedScript) => [key, updatedScript]);
    })
  );

  const baseContent = {
    name: personality.name,
    description: personality.description,
    scripts: scripts.reduce((acc, [key, val]) => {
      acc[key] = val;
      return acc;
    }, {}),
    _source: personality.filePath,
  };

  await writeJson(path.join(personalityDir, PERSONALITY_FILENAME), baseContent);

}

module.exports = personalityToFiles;
