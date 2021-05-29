const path = require('path');
const fs = require('fs/promises');
const askQuestions = require('../lib/askQuestions');
const getEddiPersonalities = require('../lib/getEddiPersonalities');
const personalityToFiles = require('../lib/personalityToFiles');
const log = require('../lib/log');
const { BUILD_BAT, WATCH_BAT } = require('../lib/constants');

exports.command = 'init';

exports.describe = 'Creates files based for all personalities';

const OPTS = {
  ext: {
    type: 'string',
    desc: 'The extension to use when created EDDI template files.',
    default: '.cottle',
    requestArg: true,
    question: 'What file extension should be used for the EDDI templates? ',
    validate: (ext) => /^[.a-z]*$/.test(ext),
    group: 'Init options:',
  },
  batchFiles: {
    type: 'boolean',
    alias: ['b', 'bat'],
    desc: "Whether to add batch files, so you can double-click a file instead of using a terminal.",
    default: false,
    requestArg: true,
    question: 'Create batch files, so you can double-click a file instead of using a terminal?',
    group: 'Init options:',
  },
};
exports.builder = OPTS;

exports.handler = async function (argv) {
  const args = await askQuestions(argv, OPTS);

  log();
  log.verbose(Object.keys(OPTS).reduce((acc, key) => {
    return acc + `\n${key}: ${args[key]}`;
  }, 'Options:'));
  log.verbose();

  await fs.copyFile(path.resolve(__dirname, '../template/README.md'), path.join(process.cwd(), 'README.md'));

  if (args.batchFiles) {
    await fs.writeFile(path.join(process.cwd(), 'build.bat'), BUILD_BAT, 'utf-8');
    await fs.writeFile(path.join(process.cwd(), 'watch.bat'), WATCH_BAT, 'utf-8');
  }

  log('Reading personalities');
  const personalities = await getPersonalities();

  log('Writing personalities');
  await Object.values(personalities).reduce((p, personality) => {
    log(`> ${personality.name}`);
    if (!p) {
      return personalityToFiles(personality, args);
    }
    return p.then(() => personalityToFiles(personality, args));
  }, null);
  log();
  log('DONE');
}
