const path = require('path');
const fs = require('fs/promises');

const { PERSONALITY_FILENAME } = require('./constants');

function normalizeExt(ext) {
  return `.${ext}`.replace('..', '.');
}

async function scriptToFile(personality, script, folder, { ext }) {
  const filePath = path.join(folder, `${script.name}${normalizeExt(ext)}`);
//   const prefix = `${GENERATED_MESSAGE}
// {_ CLI[personality]: ${personality.name} _}
// {_ CLI[name]: ${script.name} _}
// {_ CLI[description]: ${script.description} _}
// {_ CLI[enabled]: ${script.enabled} _}
// {_ CLI[enabled]: ${script.priority} _}
// {_ CLI[enabled]: ${script.responder} _}
// {_ CLI[enabled]: ${script.defaultValue} _}
//
// `;
//
//   const content = `${prefix}${script.script}`;
  const content = script.script || '';
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

  await fs.writeFile(path.join(personalityDir, PERSONALITY_FILENAME), JSON.stringify(baseContent, null, 2), 'utf-8');

}

module.exports = personalityToFiles;
