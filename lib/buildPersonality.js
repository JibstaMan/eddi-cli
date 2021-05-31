const path = require('path');
const fs = require('fs/promises');
const readJson = require('./readJson');
const writeJson = require('./writeJson');
const readTemplate = require('./readTemplate');
const computeScripts = require('./computeScripts');
const getFromConfig = require('./getFromConfig');
const log = require('./log');

const {
  PERSONALITIES_FOLDER,
  PERSONALITY_FILENAME,
  CLI_COMMENT_SETTINGS,
} = require('./constants');

async function fileToScript(script, folder) {
  const filePath = path.join(folder, script.script);
  log.verbose(`> reading template from "${filePath}"`);
  try {
    const scriptContent = await fs.readFile(filePath, 'utf-8');
    return { ...script, ...readTemplate(scriptContent, script) };
  }
  catch (e) {
    if (e.code === 'ENOENT') {
      throw new Error(`Couldn't find the template for "${script.name}". Did you move the file without updating the \`script\` path?`);
    }
    throw e;
  }
}

function diff(val, otherVal, properties) {
  return properties.some((key) => val[key] !== otherVal[key]);
}

function getWhitelist(script, personality) {
  return Object.keys(CLI_COMMENT_SETTINGS).filter((key) => {
    return !getFromConfig(CLI_COMMENT_SETTINGS[key].readOnly, true, [script, personality]);
  })
}

async function buildPersonality(personalityName) {
  const personalityDir = path.join(process.cwd(), personalityName);
  const personalityFilePath = path.join(personalityDir, PERSONALITY_FILENAME)

  const personality = await readJson(personalityFilePath);

  const scripts = await computeScripts(personality.scripts,(script) => {
    return fileToScript(script, personalityDir);
  });

  let shouldUpdateLocal = false;
  const updatedLocalPersonality = {
    ...personality,
    scripts: Object.entries(scripts).reduce((acc, [key, val]) => {
      const curVal = personality.scripts[key];
      if (diff(val, curVal, getWhitelist(val, personality))) {
        acc[key] = { ...val, script: curVal.script };
        shouldUpdateLocal = true;
      }
      else {
        acc[key] = curVal;
      }

      return acc;
    }, {}),
  };

  if (shouldUpdateLocal) {
    log.verbose(`> updating "${path.join(personalityName, PERSONALITY_FILENAME)}"`);
    await writeJson(personalityFilePath, updatedLocalPersonality);
  }
  else {
    log.verbose(`> no CLI comments were updated, not updating "${path.join(personalityName, PERSONALITY_FILENAME)}"`);
  }

  const updatedPersonality = {
    ...Object.entries(personality).reduce((acc, [key, val]) => {
      if (key[0] !== "_") {
        acc[key] = val;
      }
      return acc;
    }, {}),
    scripts,
  };

  const outputFilePath = path.join(PERSONALITIES_FOLDER, `${personalityName}.json`);
  log(`> writing output to "${outputFilePath}"`);
  await writeJson(outputFilePath, updatedPersonality);
}

module.exports = buildPersonality;
