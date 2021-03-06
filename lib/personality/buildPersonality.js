const path = require('path');
const fs = require('fs/promises');
const readJson = require('../util/readJson');
const writeJson = require('../util/writeJson');
const readTemplate = require('../template/readTemplate');
const computeScripts = require('../util/computeScripts');
const getFromConfig = require('../util/getFromConfig');
const log = require('../log');

const {
  PERSONALITIES_FOLDER,
  PERSONALITY_FILENAME,
  CLI_COMMENT_SETTINGS,
} = require('../constants');

async function fileToScript(script, folder) {
  const filePath = path.join(folder, script.script);
  log.verbose(`> Reading template from "${filePath}"`);
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

async function buildPersonality(personalityDir) {
  const personalityDirName = path.basename(personalityDir);
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
    log('> Updating ' + log.c.em(path.join(personalityDirName, PERSONALITY_FILENAME)) + '.');
    await writeJson(personalityFilePath, updatedLocalPersonality);
  }
  else {
    log.verbose(`> No CLI comments were updated, not updating "${path.join(personalityDirName, PERSONALITY_FILENAME)}"`);
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

  const outputFilePath = path.join(PERSONALITIES_FOLDER, `${personality.name.toLowerCase()}.json`);
  log('> Writing output to ' + log.c.em(outputFilePath) + '.');
  await writeJson(outputFilePath, updatedPersonality);
}

module.exports = buildPersonality;
