const path = require('path');
const fs = require('fs/promises');
const readJson = require('./readJson');
const readTemplate = require('./readTemplate');
const log = require('./log');

const { PERSONALITIES_FOLDER, PERSONALITY_FILENAME } = require('./constants');

async function fileToScript(script, folder) {
  const filePath = path.join(folder, script.script);
  log.verbose(`> reading template from "${filePath}"`);
  try {
    const scriptContent = await fs.readFile(filePath, 'utf-8');
    return { ...script, ...readTemplate(scriptContent) };
  }
  catch (e) {
    if (e.code === 'ENOENT') {
      throw new Error(`Couldn't find the template for "${script.name}". Did you move the file without updating the \`script\` path?`);
    }
    throw e;
  }
}

async function buildPersonality(personalityName) {
  const personalityDir = path.join(process.cwd(), personalityName);
  const personalityFilePath = path.join(personalityDir, PERSONALITY_FILENAME)

  const personality = await readJson(personalityFilePath);

  const scripts = await Promise.all(
    Object.entries(personality.scripts).map(([key, script]) => {
      return fileToScript(script, personalityDir)
        .then((updatedScript) => [key, updatedScript]);
    })
  );

  const updatedPersonality = {
    ...Object.entries(personality).reduce((acc, [key, val]) => {
      if (key[0] !== "_") {
        acc[key] = val;
      }
      return acc;
    }, {}),
    scripts: scripts.reduce((acc, [key, val]) => {
      acc[key] = val;
      return acc;
    }, {}),
  };

  const outputFilePath = path.join(PERSONALITIES_FOLDER, `${personalityName}.json`);
  log(`> writing output to "${outputFilePath}"`);
  await fs.writeFile(outputFilePath, JSON.stringify(updatedPersonality, null, 2), 'utf-8');
}

module.exports = buildPersonality;
