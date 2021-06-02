const path = require('path');
const chokidar = require('chokidar')
const askQuestions = require('../lib/askQuestions');
const runSafeCommand = require('../lib/util/runSafeCommand');
const getLocalPersonalityOption = require('../lib/options/getLocalPersonalityOption');
const normalizePersonality = require('../lib/options/normalizePersonality');
const readJson = require('../lib/util/readJson');
const buildPersonality = require('../lib/personality/buildPersonality');
const log = require('../lib/log');

const { PERSONALITY_FILENAME } = require('../lib/constants');

exports.command = 'watch';

exports.describe = 'Watch the personalities for changes and immediately build them';

async function getOpts() {
  const personality = await getLocalPersonalityOption();
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
    log('Template ' + log.c.em(path.relative(personalityDir, filePath)) + ' has changed');
    buildPersonality(personalityDir);
  });
}

async function watch(argv) {
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
    log('Personality ' + log.c.em(path.basename(personalityDir)) + ' has changes');

    buildPersonality(personalityDir);
    watchScripts(personalityDir, personalityFilePath);
  });

  log('Watching personality ' + log.c.em(path.basename(personalityDir)) + '.');
  log();

  watchScripts(personalityDir, personalityFilePath);
}

exports.handler = async function watchCommand(argv) {
  await runSafeCommand(watch, argv);
}

