const path = require('path');
const fs = require('fs/promises');
const readJson = require('./readJson');
const log = require('./log');

const { PERSONALITY_FILENAME, DEFAULT_PERSONALITIES, ERROR_CODES } = require('../lib/constants');

function getChoiceOption(personality, folder) {
  return {
    value: folder,
    name: `${personality.name} (${path.basename(folder)})`,
    choiceValue: path.basename(folder),
  };
}

async function normalizePersonality(personality) {
  if (path.isAbsolute(personality)) {
    return personality;
  }
  // when using -p ..., personality is only the folder name.
  return path.join(process.cwd(), personality);
}

/**
 * Checks whether the given "file" is a folder containing a personality file.
 * @param localFolder The folder name (excl path).
 * @param rootFolder The path to the folders
 * @returns {Promise<boolean|object>} The folder name when it contains a personality or false when it doesn't.
 */
async function isPersonalityFolder(localFolder, rootFolder) {
  if (DEFAULT_PERSONALITIES.includes(localFolder)) {
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

async function getPersonalityOption() {
  const personalities = await getLocalPersonalities(process.cwd());
  if (personalities.length === 0) {
    log.error("Ensure that you're using `eddi-cli` inside the folder containing the personality folders.");
    log.error(`No personalities found in "${process.cwd()}".`);
    process.exit(ERROR_CODES.NO_PERSONALITIES);
  }

  const personality = {
    alias: 'p',
    type: 'string',
    choices: personalities.map((p) => p.choiceValue),
    requestArg: true,
    questionChoices: personalities,
  };

  if (personalities.length === 1) {
    const p = personalities[0];

    personality.choices = personalities;
    personality.default = p;
    personality.defaultDescription = p.choiceValue;
    personality.requestArg = false;
    personality.hidden = true;
  }
  return personality;
}

exports.normalizePersonality = normalizePersonality;
exports.getPersonalityOption = getPersonalityOption;
exports.getLocalPersonalities = getLocalPersonalities;
