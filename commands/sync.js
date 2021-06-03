const path = require('path');
const fs = require('fs/promises');
const inquirer = require('inquirer');
const askQuestions = require('../lib/askQuestions');
const runSafeCommand = require('../lib/util/runSafeCommand');
const getEddiPersonalityOption = require('../lib/options/getEddiPersonalityOption');
const getLocalPersonalityForEddiOption = require('../lib/options/getLocalPersonalityForEddiOption');
const normalizePersonality = require('../lib/options/normalizePersonality');
const readJson = require('../lib/util/readJson');
const writeJson = require('../lib/util/writeJson');
const personalityToFiles = require('../lib/personality/personalityToFiles');
const diffPersonality = require('../lib/personality/diffPersonality');
const writeTemplate = require('../lib/template/writeTemplate');
const log = require('../lib/log');

const { CONFIG_FILENAME, PERSONALITIES_FOLDER, PERSONALITY_FILENAME } = require('../lib/constants');

exports.command = 'sync';

exports.describe = 'Synchronize changes made in EDDI with the local files';

async function getOpts() {
  const personality = await getEddiPersonalityOption();
  const localPersonality = await getLocalPersonalityForEddiOption(personality);
  return {
    personality: {
      ...personality,
      desc: 'The personality to sync',
      group: 'Sync options:',
      question: 'Which personality do you want to sync?',
    },
    localPersonality: {
      ...localPersonality,
      desc: 'The local personality to sync with',
      group: 'Sync options:',
      question: 'With which local personality do you want to sync?',
    },
  };
}

exports.builder = async function (yargs) {
  const opts = await getOpts();
  return yargs.options(opts);
};

function createDiffQuestion(diff) {
  const question = {
    name: diff.name,
    type: 'confirm',
    default: true,
  };

  const msg = 'Template ' + log.c.em(diff.name) + ' was';
  if (diff.isUnique) {
    if (diff.newer === 'eddi') {
      question.message = msg + ' added in ' + log.c.em('EDDI') + '. Do you want to ' + log.c.success('add') + ' it to ' + log.c.em('local') + '?';
    }
    else {
      question.message =  msg + ' added in ' + log.c.em('local') +'. Do you want to ' + log.c.error('remove') + ' it?';
      question.default = false;
    }
  }
  else {
    if (diff.newer === 'eddi') {
      question.message =  msg + ' last modified in ' + log.c.em('EDDI') + '. Do you want to use ' + log.c.em('EDDI') + "'s version?";
    }
    else {
      question.message =  msg + ' last modified in ' + log.c.em('local') +
        '. Do you want to ' + log.c.success('keep') + ' using the ' + log.c.em('local') + ' version?';
    }
  }

  return question;
}

async function sync(argv) {
  const opts = await getOpts();
  const args = await askQuestions(argv, opts);
  args.personality = await normalizePersonality(args.personality, PERSONALITIES_FOLDER);
  args.localPersonality = await normalizePersonality(args.localPersonality);

  log();
  log.options(args, opts);

  const localPersonalityDir = args.localPersonality;

  const rootFolder = (localPersonalityDir) ? path.resolve(args.localPersonality, '..') : process.cwd();
  let configOpts;
  try {
    configOpts = await readJson(path.join(rootFolder, CONFIG_FILENAME));
  }
  catch (e) {
    if (e.code === 'ENOENT') {
      log.error('The sync command requires the information stored in ".eddi-cli-config.json". ' +
      `You're using \`eddi-cli\` in folder "${process.cwd()}", which doesn't have that file. ` +
      "Please make sure you're using `eddi-cli` in the correct folder. If you haven't yet initialized, " +
      'please use `npx eddi-cli init` to start an EDDI project folder with all the necessary setup included.');
      throw new Error("Couldn't locate ./eddi-cli-config.json");
    }
    throw e;
  }

  const eddiPersonality = await readJson(args.personality);

  if (localPersonalityDir === null) {
    log.warn('It looks like no ' + log.c.em('local') + ' personalities matches the selected ' + log.c.em('EDDI') + ' personality.');

    const answers = await inquirer.prompt([{
      name: 'newLocal',
      type: 'confirm',
      default: true,
      message: 'Do you want to create a new local personality for ' + log.c.em(path.basename(args.personality)) + '?',
    }]);

    if (answers.newLocal) {
      log();
      log('> Writing ' + log.c.em(eddiPersonality.name) + '.');
      eddiPersonality.filePath = args.personality;
      await personalityToFiles(eddiPersonality, {
        ext: configOpts.extension,
        templateSettings: configOpts.templateSettings,
      });
    }

    log();
    log('DONE');
    return;
  }

  log('Checking differences between local personality ' + log.c.em(path.basename(localPersonalityDir)) +
    " and EDDI's " + log.c.em(path.basename(args.personality)) + '.');
  log();

  const diffMap = await diffPersonality(args.personality, localPersonalityDir);

  const syncQuestions = Object.values(diffMap).reduce((acc, diff) => {
    if (diff.isUnique || diff.isDifferent) {
      acc.push(createDiffQuestion(diff));
    }
    return acc;
  }, []);

  if (!syncQuestions.length) {
    log.success("No differences found, so there's nothing to synchronize.");
    log();
    log('DONE');
    return;
  }
  log.warn('When the question states that the template was last modified in ' + log.c.em('EDDI') +
    ', it means that the EDDI personality file was modified after the ' + log.c.em('local') + ' version was modified.',
    "Since EDDI saves all templates in one go, `eddi-cli` can't judge which version is newer.");
  log();

  const answers = await inquirer.prompt(syncQuestions);

  const personalityFilePath = path.join(localPersonalityDir, PERSONALITY_FILENAME);
  const personality = await readJson(personalityFilePath);

  log();
  log('Starting to sync based on the answers given.');
  log.verbose();

  let madeAnyChanges = false;
  let shouldUpdatePersonality = false;
  for (const [key, answer] of Object.entries(answers)) {
    const diff = diffMap[key];

    if (diff.isUnique) {
      if (diff.newer === 'eddi') {
        if (answer === true) {
          log('> Adding EDDI template ' + log.c.em(diff.name) + ' to the local personality.');
          personality.scripts[key] = await writeTemplate(personality, eddiPersonality.scripts[key], localPersonalityDir, {
            ext: configOpts.extension,
            templateSettings: configOpts.templateSettings,
            personalityDir: localPersonalityDir,
          });
          shouldUpdatePersonality = true;
          madeAnyChanges = true;
        }
        else {
          log.verbose(`> Opted to skip adding EDDI template "${diff.name}" to the local personality.`)
        }
      }
      else {
        if (answer === true) {
          log('> Deleting local template ' + log.c.em(diff.name) + '.')
          const templatePath = path.join(localPersonalityDir, personality.scripts[key].script);
          delete personality.scripts[key];
          await fs.rm(templatePath);
          shouldUpdatePersonality = true;
          madeAnyChanges = true;
        }
        else {
          log.verbose(`> Opted to skip deleting local template "${diff.name}".`);
        }
      }
    }
    else {
      if ((diff.newer === 'eddi' && answer === true) || (diff.newer === 'local' && answer === false)) {
        log('> Overwriting content of local template ' + log.c.em(diff.name) + ' with the ' + log.c.em('EDDI') + ' version.');
        const templatePath = path.join(localPersonalityDir, personality.scripts[key].script);
        const templateDir = path.dirname(templatePath);
        await writeTemplate(personality, eddiPersonality.scripts[key], templateDir, {
          ext: configOpts.extension,
          templateSettings: configOpts.templateSettings,
          personalityDir: localPersonalityDir,
        });
        madeAnyChanges = true;
      }
      else {
        log.verbose(`> Opted to skip overwriting content of local template "${diff.name}" with EDDI's version.`)
      }
    }
  }

  log();

  if (shouldUpdatePersonality) {
    log('Updating personality ' + log.c.em(path.basename(args.personality)) + ' with all the changes.');
    await writeJson(personalityFilePath, personality);
  }
  else {
    log.verbose(`No additions or deletions, so skipped updating personality "${path.basename(args.personality)}".`)
  }

  if (!madeAnyChanges) {
    log.warn('The given answers resulted in nothing being changes.');
    log(log.c.gray('You can use `npx eddi-cli diff` to get information about differences.'));
  }

  log();
  log('DONE');
}

exports.handler = async function syncCommand(argv) {
  await runSafeCommand(sync, argv);
}
