const path = require('path');
const fs = require('fs/promises');
const util = require('util');
const globCb = require('glob');
const askQuestions = require('../lib/askQuestions');
const runSafeCommand = require('../lib/util/runSafeCommand');
const getLocalPersonalityOption = require('../lib/options/getLocalPersonalityOption');
const normalizePersonality = require('../lib/options/normalizePersonality');
const readJson = require('../lib/util/readJson');
const writeJson = require('../lib/util/writeJson');
const computeScripts = require('../lib/util/computeScripts');
const log = require('../lib/log');

const { PERSONALITY_FILENAME } = require('../lib/constants');

const glob = util.promisify(globCb);

exports.command = 'reconcile';

exports.describee = 'Update all paths after files have been restructured'

async function getOpts() {
  const personality = await getLocalPersonalityOption();
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
  log('> Template ' + log.c.em(template.name) + ' will be reconciled with ' + log.c.em(newPath) + '.');
  return {
    ...template,
    script: newPath,
  };
}

async function reconcile(argv) {
  const opts = await getOpts();
  const args = await askQuestions(argv, opts);
  args.personality = await normalizePersonality(args.personality);

  log();
  log.options(args, opts);

  const personalityDir = args.personality;
  const personalityFilePath = path.join(personalityDir, PERSONALITY_FILENAME)

  const personality = await readJson(personalityFilePath);

  log('Starting to reconcile all the templates.');

  let madeAnyChanges = false;
  const scripts = await computeScripts(personality.scripts, (script) => {
    return checkTemplate(script, personalityDir)
      .then((updatedScript) => {
        if (!madeAnyChanges) {
          madeAnyChanges = script !== updatedScript;
        }
        return updatedScript;
      });
  });

  if (madeAnyChanges) {
    const updatedPersonality = {
      ...personality,
      scripts,
    };
    log();
    log('Updating personality ' + log.c.em(path.basename(args.personality)) + ' with all the changes.');
    await writeJson(personalityFilePath, updatedPersonality);
  }
  else {
    log();
    log.success('All the templates are correctly linked to their respective files.');
  }
  log();

  log('DONE');
}

exports.handler = async function reconcileCommand(argv) {
  await runSafeCommand(reconcile, argv);
}
