const path = require('path');
const fs = require('fs/promises');

const { PERSONALITY_FILENAME } = require('../lib/constants');

/**
 * Checks whether the given "file" is a folder containing a personality file.
 * @param localFolder The folder name (excl path).
 * @param rootFolder The path to the folders
 * @returns {Promise<boolean|string>} The folder name when it contains a personality or false when it doesn't.
 */
async function isPersonalityFolder(localFolder, rootFolder) {
  const folderPath = path.join(rootFolder, localFolder);
  const stats = await fs.stat(folderPath);
  if (!stats?.isDirectory()) {
    return false;
  }

  const personalityStats = await fs.stat(path.join(folderPath, PERSONALITY_FILENAME));
  if (!personalityStats.isFile()) {
    return false;
  }
  return localFolder;
}

async function getLocalPersonalities(rootFolder) {
  const localFiles = await fs.readdir(rootFolder);

  const personalities = await Promise.all(localFiles.map(
    (fileName) => isPersonalityFolder(fileName, rootFolder)
  ));
  return personalities.filter(Boolean);
}

module.exports = getLocalPersonalities;
