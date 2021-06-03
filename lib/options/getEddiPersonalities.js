const path = require('path');
const fs = require('fs/promises');
const readJson = require('../util/readJson');
const log = require('../log');

const { PERSONALITIES_FOLDER, PERSONALITY_FILENAME, DEFAULT_PERSONALITIES } = require('../constants');

async function getProcessContextPersonality() {
  try {
    const localPersonalityPath = path.join(process.cwd(), PERSONALITY_FILENAME);
    return await readJson(localPersonalityPath);
  }
  catch (e) {
    if (e.code === 'ENOENT') {
      return null;
    }
    throw e;
  }
}

async function getEddiPersonalities({ skipDefault = false, checkCwd = false } = {}) {
  log.verbose(`> From "${PERSONALITIES_FOLDER}".`);
  let personalityFileNames = await fs.readdir(PERSONALITIES_FOLDER);

  if (skipDefault) {
    personalityFileNames = personalityFileNames.filter((fileName) => {
      return !DEFAULT_PERSONALITIES.includes(path.basename(fileName.toLowerCase(), '.json'));
    });
  }

  let localPersonality = null;
  if (checkCwd) {
    localPersonality = await getProcessContextPersonality();
  }

  const personalityFiles = await Promise.all(
    personalityFileNames.reverse().map(async (fileName) => {
      if (path.extname(fileName) !== '.json') {
        log.verbose(`> Skipping non-JSON file: ${fileName}`);
        return null;
      }
      log.verbose(`> Reading personality "${fileName}".`);
      const filePath = path.join(PERSONALITIES_FOLDER, fileName);

      try {
        const personality = await readJson(filePath);

        if (localPersonality && localPersonality.name !== personality.name) {
          return null;
        }
        return { ...personality, filePath };
      }
      catch (e) {
        log.error(`Failed to parse ${fileName} personality`);
        throw e;
      }
    })
  );

  return personalityFiles.reduce((acc, personality) => {
    if (personality) {
      acc[personality.name] = personality;
    }
    return acc;
  }, {});
}

module.exports = getEddiPersonalities;
