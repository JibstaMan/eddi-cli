const askQuestions = require('../lib/askQuestions');
const getLocalPersonalities = require('../lib/getLocalPersonalities');
const buildPersonality = require('../lib/buildPersonality');
const log = require('../lib/log');

exports.command = 'build';

exports.describe = 'Build the EDDI personality JSON from the source files';

async function getOpts() {
  const personalities = await getLocalPersonalities(process.cwd());
  return {
    personality: {
      alias: 'p',
      desc: 'The personality to build',
      type: 'string',
      choices: personalities,
      group: 'Build options:',
      requestArg: true,
    },
  };
}

exports.builder = async function (yargs) {
  const opts = await getOpts();
  return yargs.options(opts);
};

exports.handler = async function (argv) {
  const opts = await getOpts();
  const args = await askQuestions(argv, opts);

  log();
  log.options(args, opts);

  log(`Building personality "${args.personality}"`);

  await buildPersonality(args.personality);

  log();
  log('DONE');
}
