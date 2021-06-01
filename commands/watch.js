const path = require('path');
const chokidar = require('chokidar')
const askQuestions = require('../lib/askQuestions');
const { getPersonalityOption, normalizePersonality } = require('../lib/getLocalPersonalities');
const readJson = require('../lib/readJson');
const buildPersonality = require('../lib/buildPersonality');
const log = require('../lib/log');

const { PERSONALITY_FILENAME } = require('../lib/constants');

exports.command = 'watch';

exports.describe = 'Watch the personalities for changes and immediately build them';

async function getOpts() {
  const personality = await getPersonalityOption();
  return {
    personality: {
      ...personality,
      desc: 'Only watch for changes within this personality',
      group: 'Watch options:',
      question: 'Which personality do you want to watch for changes?',
    },
  };
}

exports.builder = async function (yargs) {
  const opts = await getOpts();
  return yargs.options(opts);
};

function createWatchList(personality, personalityDir) {
  return Object.values(personality.scripts)
    .map((script) => path.join(personalityDir, script.script));
}

let fileWatcher = null;
async function watchScripts(personalityDir, personalityFilePath) {
  if (fileWatcher) {
    await fileWatcher.close();
  }

  const personality = await readJson(personalityFilePath);
  fileWatcher = chokidar.watch(createWatchList(personality, personalityDir), {
    ignoreInitial: true,
    awaitWriteFinish: true,
  });

  fileWatcher.on('change', (filePath) => {
    log();
    log(`${path.relative(personalityDir, filePath)} has changed`);
    buildPersonality(personalityDir);
  });
}

exports.handler = async function (argv) {
  const opts = await getOpts();
  const args = await askQuestions(argv, opts);
  args.personality = await normalizePersonality(args.personality);

  log();
  log.options(args, opts);

  const personalityDir = args.personality;
  const personalityFilePath = path.join(personalityDir, PERSONALITY_FILENAME);

  const personalityWatcher = chokidar.watch(personalityFilePath, {
    ignoreInitial: true,
    awaitWriteFinish: true,
  });

  personalityWatcher.on('ready', () => buildPersonality(personalityDir));
  personalityWatcher.on('change', (filePath) => {
    log();
    log(`Personality "${path.basename(personalityDir)}" has changes`);

    buildPersonality(personalityDir);
    watchScripts(personalityDir, personalityFilePath);
  });

  log(`Watching personality "${path.basename(personalityDir)}"`);
  log();

  watchScripts(personalityDir, personalityFilePath);
}
