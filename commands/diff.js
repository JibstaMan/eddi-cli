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

  if (args.localPersonality === null) {
    log.warn('It looks like no ' + log.c.em('local') + ' personalities matches the selected ' + log.c.em('EDDI') + ' personality.');
    log.warn('So everything is different.');
    log();
    log('DONE');
    return;
  }

  log('Checking differences between local personality ' + log.c.em(path.basename(args.localPersonality)) +
    " and EDDI's " + log.c.em(path.basename(args.personality)) + '.');
  const diffMap = await diffPersonality(args.personality, args.localPersonality);

  log();
  Object.values(diffMap).forEach((diff) => {
    const newer = (diff.newer === 'eddi') ? 'EDDI' : 'local';
    if (diff.isUnique) {
      log('> Template ' + log.c.em(diff.name) + ' was added in ' + log.c.em(`${newer}`) + '.');
    }
    else if (diff.isDifferent) {
      log('> Template ' + log.c.em(diff.name) + ' is different. The ' + log.c.em(newer) + ' version was modified more recently.');
    }
  });
  log();
  log.warn('All ' + log.c.em('EDDI') + ' occurrences above are based on when the EDDI personality file was last modified. ' +
    "Since EDDI saves all templates in the same file, EDDI CLI can't judge which version is newer. " +
    'If ' + log.c.em('EDDI') + ' is mentioned for all differences, it just means you changed the EDDI personality after any local changes.');

  log();
  log('DONE');
}

exports.handler = async function diffCommand(argv) {
  await runSafeCommand(diff, argv);
}
