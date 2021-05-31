const askQuestions = require('../lib/askQuestions');
const { getPersonalityOption } = require('../lib/getLocalPersonalities');
const buildPersonality = require('../lib/buildPersonality');
const log = require('../lib/log');

const { ERROR_CODES } = require('../lib/constants');

exports.command = 'build';

exports.describe = 'Build the EDDI personality JSON from the source files';

async function getOpts() {
  const personality = await getPersonalityOption();
  return {
    personality: {
      ...personality,
      desc: 'The personality to build',
      group: 'Build options:',
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

  log();
  log.options(args, opts);

  log(`Building personality "${args.personality}"`);

  await buildPersonality(args.personality);

  log();
  log('DONE');
}

exports.handler = async function buildCommand(argv) {
  try {
    await build(argv);
  }
  catch (e) {
    log.error(e.message);
    process.exit(ERROR_CODES.GENERIC_ERROR);
  }
}
