const path = require('path');
const askQuestions = require('../lib/askQuestions');
const runSafeCommand = require('../lib/util/runSafeCommand');
const getLocalPersonalityOption = require('../lib/options/getLocalPersonalityOption');
const normalizePersonality = require('../lib/options/normalizePersonality');
const buildPersonality = require('../lib/personality/buildPersonality');
const log = require('../lib/log');

exports.command = 'build';

exports.describe = 'Build the EDDI personality JSON from the source files';

async function getOpts() {
  const personality = await getLocalPersonalityOption();
  return {
    personality: {
      ...personality,
      desc: 'The personality to build',
      group: 'Build options:',
      question: 'Which personality do you want to build?',
    },
  };
}

exports.builder = async function (yargs) {
  const opts = await getOpts();
  return yargs.options(opts);
};

async function build(argv) {
  const opts = await getOpts();
  const args = await askQuestions(argv, opts);
  args.personality = await normalizePersonality(args.personality);

  log();
  log.options(args, opts);

  log(`Building personality "${path.basename(args.personality)}"`);

  await buildPersonality(args.personality);

  log();
  log('DONE');
}

exports.handler = async function buildCommand(argv) {
  await runSafeCommand(build, argv);
}
