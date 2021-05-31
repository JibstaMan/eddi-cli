const path = require('path');
const fs = require('fs/promises');

const { verbose } = require('./log');
const { PERSONALITIES_FOLDER } = require('./constants');

async function getEddiPersonalities() {
  verbose(`> from "${PERSONALITIES_FOLDER}"`);
  const personalityFileNames = await fs.readdir(PERSONALITIES_FOLDER);
  const personalityFiles = await Promise.all(
    personalityFileNames.reverse().map(async (fileName) => {
      if (path.extname(fileName) !== '.json') {
        verbose(`> skipping non-JSON file: ${fileName}`);
        return null;
      }
      verbose(`> reading ${fileName}`);
      const filePath = path.join(PERSONALITIES_FOLDER, fileName);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const nonBOMFileContent = fileContent.slice(1);

      try {
        const personality = JSON.parse(nonBOMFileContent);
        return { ...personality, filePath };
      }
      catch (e) {
        console.error(`Failed to parse ${fileName} personality`);
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
