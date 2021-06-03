const path = require('path');
const fs = require('fs/promises');
const writeJson = require('../util/writeJson');
const writeTemplate = require('../template/writeTemplate');
const computeScripts = require('../util/computeScripts');
const log = require('../log');

const { PERSONALITY_FILENAME } = require('../constants');

async function personalityToFiles(personality, options) {
  if (!personality) {
    return;
  }

  const personalityDir = path.join(process.cwd(), personality.name);
  const backupDir = path.join(personalityDir, 'backup');
  try {
    await fs.mkdir(personalityDir);
  }
  catch (e) {
    if (e.code === 'EEXIST') {
      const personalityFiles = await fs.readdir(personalityDir);
      if (personalityFiles.length !== 0) {
        log();
        log.error(`The folder "${personality.name}" already exists and has files in it.`);
        log.error('To prevent EDDI CLI from overwriting anything, backup the files ' +
          'and make sure the folder is empty, before running the command again.');
        throw new Error("EDDI CLI won't create a personality in a folder that already has content.");
      }
    }
    else {
      throw e;
    }
  }
  await fs.mkdir(backupDir);

  await fs.copyFile(personality.filePath, path.join(backupDir, path.basename(personality.filePath)));

  const scripts = await computeScripts(personality.scripts,(script) => {
    return writeTemplate(personality, script, personalityDir, {
      ...options,
      personalityDir
    });
  });

  const baseContent = {
    name: personality.name,
    description: personality.description,
    scripts,
    _source: personality.filePath,
  };

  await writeJson(path.join(personalityDir, PERSONALITY_FILENAME), baseContent);

}

module.exports = personalityToFiles;
