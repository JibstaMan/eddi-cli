const path = require('path');
const fs = require('fs/promises');
const writeJson = require('./writeJson');
const scriptToFile = require('./scriptToFile');

const { PERSONALITY_FILENAME } = require('./constants');

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
      return scriptToFile(personality, script, personalityDir, { ...options, personalityDir })
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
