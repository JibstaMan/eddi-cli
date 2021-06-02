const path = require('path');
const fs = require('fs/promises');
const readJson = require('../util/readJson');
const readTemplate = require('../template/readTemplate');
const computeScripts = require('../util/computeScripts');

const { PERSONALITY_FILENAME } = require('../constants');

function getUniqueScripts(arr1, arr2, uniqueIn) {
  return arr1.reduce((acc, script) => {
    if (arr2.includes(script)) {
      return acc;
    }
    acc[script] = {
      isUnique: true,
      isDifferent: true,
      newer: uniqueIn,
      name: script,
    };
    return acc;
  }, {});
}

async function compare(key, eddiScript, eddiLastEdit, script, localPersonalityPath) {
  const templatePath = path.join(localPersonalityPath, script.script);
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const template = readTemplate(templateContent, script);

  const localStats = await fs.stat(templatePath);

  const diff = {
    isUnique: false,
    isDifferent: true,
    name: key,
  }

  if (template.script !== eddiScript.script) {
    if (localStats.mtime > eddiLastEdit) {
      return { ...diff, newer: 'local' };
    }
    return { ...diff, newer: 'eddi' };
  }
  return  { ...diff, isDifferent: false };
}

async function diffPersonality(eddiPersonalityPath, localPersonalityPath) {
  const eddiPersonality = await readJson(eddiPersonalityPath);
  const eddiStats = await fs.stat(eddiPersonalityPath);

  const localPersonality = await readJson(path.join(localPersonalityPath, PERSONALITY_FILENAME));

  const eddiScripts = Object.keys(eddiPersonality.scripts);
  const localScripts = Object.keys(localPersonality.scripts);
  const onlyEddiScripts = getUniqueScripts(eddiScripts, localScripts, 'eddi');
  const onlyLocalScripts = getUniqueScripts(localScripts, eddiScripts, 'local');

  const comparedScripts = await computeScripts(localPersonality.scripts,(script, key) => {
    const eddiScript = eddiPersonality.scripts[key];
    if (!eddiScript) {
      return Promise.resolve(null); // value will be overwritten by onlyLocalScripts
    }
    return compare(key, eddiScript, eddiStats.mtime, script, localPersonalityPath);
  });

  return {
    ...comparedScripts,
    ...onlyEddiScripts,
    ...onlyLocalScripts,
  };
}

module.exports = diffPersonality;
