const path = require('path');
const fs = require('fs/promises');
const chokidar = require('chokidar')
const askQuestions = require('../lib/askQuestions');
const readJson = require('../lib/readJson');
const buildPersonality = require('../lib/buildPersonality');
const log = require('../lib/log');

const { PERSONALITY_FILENAME } = require('../lib/constants');

exports.command = 'watch';

exports.describe = 'Watch the personalities for changes and immediately build them.';

async function getOpts() {
  const personalities = await fs.readdir(process.cwd());
  return {
    personality: {
      alias: 'p',
      desc: 'Only watch for changes within this personality',
      type: 'string',
      choices: personalities,
      group: 'Watch options:',
      requestArg: true,
    },
  };
}

exports.builder = async function (yargs) {
  const opts = await getOpts();
  return yargs.options(opts);
};

function createWatchList(personality) {
  return Object.values(personality.scripts)
    .map((script) => path.join(process.cwd(), personality.name, script.script));
}

let fileWatcher = null;
async function watchScripts(personalityName, personalityFilePath) {
  if (fileWatcher) {
    await fileWatcher.close();
  }

  const personality = await readJson(personalityFilePath);
  fileWatcher = chokidar.watch(createWatchList(personality), {
    ignoreInitial: true,
    awaitWriteFinish: true,
  });

  fileWatcher.on('change', (filePath) => {
    log();
    log(`${path.relative(process.cwd(), filePath)} has changed`);
    buildPersonality(personalityName);
  });
}

exports.handler = async function (argv) {
  const opts = await getOpts();
  const args = await askQuestions(argv, opts);

  log();
  log.verbose(Object.keys(opts).reduce((acc, key) => {
    return acc + `\n${key}: ${args[key]}`;
  }, 'Options:'));
  log.verbose();

  log(`Watching personality "${args.personality}"`);
  log();

  const personalityName = args.personality;
  log(process.cwd(), personalityName, PERSONALITY_FILENAME);
  const personalityFilePath = path.join(process.cwd(), personalityName, PERSONALITY_FILENAME);
  const configWatcher = chokidar.watch(personalityFilePath);

  configWatcher.on('ready', () => buildPersonality(personalityName));
  configWatcher.on('change', (filePath) => {
    log();
    log(`${personalityName} has changes`);

    buildPersonality(personalityName);

    watchScripts(personalityName, personalityFilePath);
  });

  watchScripts(personalityName, personalityFilePath);
}
