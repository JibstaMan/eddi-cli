const path = require('path');
const fs = require('fs/promises');
const askQuestions = require('../lib/askQuestions');
const runSafeCommand = require('../lib/util/runSafeCommand');
const getLocalPersonalityOption = require('../lib/options/getLocalPersonalityOption');
const normalizePersonality = require('../lib/options/normalizePersonality');
const readJson = require('../lib/util/readJson');
const writeJson = require('../lib/util/writeJson');
const scriptToFile = require('../lib/template/writeTemplate');
const log = require('../lib/log');

const { CONFIG_FILENAME, PERSONALITY_FILENAME } = require('../lib/constants');

exports.command = 'create';

exports.describe = 'Creates a new template file for a specific personality';

async function getOpts() {
  const personality = await getLocalPersonalityOption();
  return {
    personality: {
      ...personality,
      desc: 'The personality to add the template to',
      group: 'Create options:',
      question: 'For which personality do you want to create a new template?',
    },
    templateName: {
      alias: ['template', 'name', 't'],
      desc: 'The name of the template (aka EDDI script)',
      type: 'string',
      group: 'Create options:',
      requestArg: true,
      question: 'What is the name of the template?',
    },
    templateDescription: {
      alias: ['description', 'desc', 'd'],
      desc: 'The description of the template',
      type: 'string',
      group: 'Create options:',
      requestArg: true,
      question: 'What is the description of the template?',
    },
    templatePath: {
      alias: ['path'],
      desc: 'The path to the template (e.g. "body" or "body/custom")',
      type: 'string',
      group: 'Create options:',
      requestArg: true,
      question: 'What should be the path to the template (e.g.  "body" or "body/custom")?'
    },
  };
}

exports.builder = async function (yargs) {
  const opts = await getOpts();
  return yargs.options(opts);
};

function normalizePath(filePath) {
  return filePath.replace(/^[.\\\/]*/, '');
}

async function create(argv) {
  const opts = await getOpts();
  const args = await askQuestions(argv, opts);
  args.personality = await normalizePersonality(args.personality);

  log();
  log.options(args, opts);

  const configOpts = await readJson(path.join(path.resolve(args.personality, '..'), CONFIG_FILENAME));
  const templateFolder = normalizePath(args.templatePath);
  const relativePath = path.join(templateFolder, `${args.templateName}${configOpts.extension}`);

  const template = {
    name: args.templateName,
    description: args.templateDescription,
    enabled: true,
    priority: null,
    responder: false,
    script: '',
    defaultValue: '',
    default: false,
  };

  const personalityDir = args.personality;
  const personalityFilePath = path.join(personalityDir, PERSONALITY_FILENAME)

  const personality = await readJson(personalityFilePath);

  const folderPath = path.join(personalityDir, templateFolder);
  await fs.mkdir(folderPath, { recursive: true });

  log(`Creating template at "${path.join(personalityDir, relativePath)}"`);
  const updatedScript = await scriptToFile(personality, template, folderPath, {
    ext: configOpts.extension,
    templateSettings: configOpts.templateSettings,
    personalityDir,
  });

  const scripts = { ...personality.scripts, [template.name]: updatedScript };
  personality.scripts = Object.keys(scripts).sort().reduce((acc, key) => {
    acc[key] = scripts[key];
    return acc;
  }, {});

  log(`Adding template to personality "${path.basename(args.personality)}"`);
  await writeJson(personalityFilePath, personality);
}

exports.handler = async function createCommand(argv) {
  await runSafeCommand(create, argv);
}
