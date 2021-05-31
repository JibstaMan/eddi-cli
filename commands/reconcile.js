const path = require('path');
const fs = require('fs/promises');
const util = require('util');
const globCb = require('glob');
const askQuestions = require('../lib/askQuestions');
const { getPersonalityOption } = require('../lib/getLocalPersonalities');
const readJson = require('../lib/readJson');
const writeJson = require('../lib/writeJson');
const computeScripts = require('../lib/computeScripts');
const log = require('../lib/log');

const { PERSONALITY_FILENAME, ERROR_CODES } = require('../lib/constants');

const glob = util.promisify(globCb);

exports.command = 'reconcile';

exports.describee = 'Update all paths after files have been restructured'

async function getOpts() {
  const personality = await getPersonalityOption();
  return {
    personality: {
      ...personality,
      desc: 'The personality to reconcile the paths for',
      group: 'Reconcile options:',
      question: 'For which personality do you want to reconcile the paths?',
    },
  };
}

exports.builder = async function (yargs) {
  const opts = await getOpts();
  return yargs.options(opts);
};

async function checkTemplate(template, personalityDir) {
  try {
    await fs.stat(path.join(personalityDir, template.script));
    log.verbose(`> Template "${template.name}" hasn't moved.`);
    return template;
  }
  catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }

  const templateFileName = path.basename(template.script);
  const result = await glob(`**/${templateFileName}`, {
    cwd: personalityDir,
  });

  if (result.length > 1) {
    log.error(`> Template "${template.name}" doesn't have a unique file name ("${templateFileName}").`);
    log.error(`  - Please update this template within ${PERSONALITY_FILENAME} yourself or remove the duplicate file and use \`reconcile\` again.`)
    return template;
  }
  if (result.length === 0) {
    log.error(`> Template "${template.name}" can't be found (file name: "${templateFileName}").`)
    log.error(`  - Please update this template within ${PERSONALITY_FILENAME} yourself to the correct path and file name.`);
    return template;
  }

  const [filePath] = result;
  const newPath = `.\\${path.normalize(filePath)}`;
  log(`> Template "${template.name}" will be reconciled with "${newPath}".`);
  return {
    ...template,
    script: newPath,
  };
}

async function reconcile(argv) {
  const opts = await getOpts();
  const args = await askQuestions(argv, opts);

  log();
  log.options(args, opts);

  const personalityDir = path.join(process.cwd(), args.personality);
  const personalityFilePath = path.join(personalityDir, PERSONALITY_FILENAME)

  const personality = await readJson(personalityFilePath);

  const scripts = await computeScripts(personality.scripts, (script) => {
    return checkTemplate(script, personalityDir);
  });

  const updatedPersonality = {
    ...personality,
    scripts,
  };
  await writeJson(personalityFilePath, updatedPersonality);

  log();
  log('If you see no logging above, all the templates are correctly linked to their respective files.')
  log();

  log('DONE');
}

exports.handler = async function reconcileCommand(argv) {
  try {
    await reconcile(argv);
  }
  catch (e) {
    log.error(e.message);
    process.exit(ERROR_CODES.GENERIC_ERROR);
  }
}
