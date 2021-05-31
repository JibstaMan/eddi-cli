const path = require('path');
const fs = require('fs/promises');
const askQuestions = require('../lib/askQuestions');
const { getPersonalityOption } = require('../lib/getLocalPersonalities');
const readJson = require('../lib/readJson');
const writeJson = require('../lib/writeJson');
const scriptToFile = require('../lib/scriptToFile');
const log = require('../lib/log');

const { CONFIG_FILENAME, PERSONALITY_FILENAME, ERROR_CODES } = require('../lib/constants');

exports.command = 'create';

exports.describe = 'Creates a new template file for a specific personality';

async function getOpts() {
  const personality = await getPersonalityOption();
  return {
    personality: {
      ...personality,
      desc: 'The personality to add the template to',
      group: 'Create options:',
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
    priority: {
      alias: 'prio',
      desc: 'The priority EDDI gives to this template (lower is higher priority)',
      type: 'number',
      default: 3,
      validate: (number) => number > 0,
      group: 'Create options:',
      requestArg: true,
      question: 'What priority should EDDI assign to this template (lower is higher priority)?'
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

  log();
  log.options(args, opts);

  const configOpts = await readJson(path.join(process.cwd(), CONFIG_FILENAME));
  const templateFolder = normalizePath(args.templatePath);
  const relativePath = path.join(templateFolder, `${args.templateName}${configOpts.extension}`);

  const template = {
    name: args.templateName,
    description: args.templateDescription,
    enabled: true,
    priority: args.priority,
    responder: false,
    script: '',
    defaultValue: '',
    default: false,
  };

  const personalityDir = path.join(process.cwd(), args.personality);
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

  log(`Adding template to personality "${args.personality}"`);
  await writeJson(personalityFilePath, personality);
}

exports.handler = async function createCommand(argv) {
  try {
    await create(argv);
  }
  catch (e) {
    log.error(e.message);
    process.exit(ERROR_CODES.GENERIC_ERROR);
  }
}
