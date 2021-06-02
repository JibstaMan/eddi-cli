const path = require('path');
const askQuestions = require('../lib/askQuestions');
const runSafeCommand = require('../lib/util/runSafeCommand');
const getEddiPersonalityOption = require('../lib/options/getEddiPersonalityOption');
const getLocalPersonalityForEddiOption = require('../lib/options/getLocalPersonalityForEddiOption');
const normalizePersonality = require('../lib/options/normalizePersonality');
const diffPersonality = require('../lib/personality/diffPersonality');
const log = require('../lib/log');

const { PERSONALITIES_FOLDER } = require('../lib/constants');

exports.command = 'diff';

exports.describe = 'Find differences between the EDDI version and the local files';

async function getOpts() {
  const personality = await getEddiPersonalityOption();
  const localPersonality = await getLocalPersonalityForEddiOption(personality);
  return {
    personality: {
      ...personality,
      desc: 'The personality to get the differences for',
      group: 'Diff options:',
      question: 'Which personality do you want to get the differences for?',
    },
    localPersonality: {
      ...localPersonality,
      desc: 'The local personality to get the differences for',
      group: 'Diff options:',
      question: 'Which local personality do you want to get the differences for?',
    },
  };
}

exports.builder = async function (yargs) {
  const opts = await getOpts();
  return yargs.options(opts);
};

async function diff(argv) {
  const opts = await getOpts();
  const args = await askQuestions(argv, opts);
  args.personality = await normalizePersonality(args.personality, PERSONALITIES_FOLDER);
  args.localPersonality = await normalizePersonality(args.localPersonality);

  log();
  log.options(args, opts);

  log(`Checking differences for "${path.basename(args.personality)}"`);
  const diffMap = await diffPersonality(args.personality, args.localPersonality);

  log();
  Object.values(diffMap).forEach((diff) => {
    const newer = (diff.newer === 'eddi') ? 'EDDI' : 'local';
    if (diff.isUnique) {
      log(`Template "${diff.name}" was added in`, log.em(`${newer}`));
    }
    else if (diff.isDifferent) {
      log(`Template "${diff.name}" was last modified in`, log.em(newer));
    }
  });

  log();
  log('DONE');
}

exports.handler = async function diffCommand(argv) {
  await runSafeCommand(diff, argv);
}
