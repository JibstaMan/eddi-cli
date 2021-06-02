const path = require('path');
const fs = require('fs/promises');
const readJson = require('../util/readJson');
const getChoiceOption = require('./util/getChoiceOption');

const { PERSONALITY_FILENAME, DEFAULT_PERSONALITIES } = require('../constants');

/**
 * Checks whether the given "file" is a folder containing a personality file.
 * @param localFolder The folder name (excl path).
 * @param rootFolder The path to the folders
 * @returns {Promise<boolean|object>} The folder name when it contains a personality or false when it doesn't.
 */
async function isPersonalityFolder(localFolder, rootFolder) {
  if (DEFAULT_PERSONALITIES.includes(localFolder.toLowerCase())) {
    return false;
  }

  const folderPath = path.join(rootFolder, localFolder);
  const stats = await fs.stat(folderPath);
  if (!stats?.isDirectory()) {
    return false;
  }

  try {
    const personality = await readJson(path.join(folderPath, PERSONALITY_FILENAME));
    return getChoiceOption(personality, folderPath);
  }
  catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }
  return false;
}

async function getLocalPersonalities(rootFolder) {
  const localFiles = await fs.readdir(rootFolder);

  if (localFiles.includes(PERSONALITY_FILENAME)) {
    const personality = await readJson(path.join(rootFolder, PERSONALITY_FILENAME));
    // cwd is a personality folder, so that's the only option.
    return [getChoiceOption(personality, rootFolder)];
  }

  const personalities = await Promise.all(localFiles.map(
    (fileName) => isPersonalityFolder(fileName, rootFolder)
  ));
  return personalities.filter(Boolean);
}

module.exports = getLocalPersonalities;
