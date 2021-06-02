const path = require('path');
const fs = require('fs/promises');
const askQuestions = require('../lib/askQuestions');
const runSafeCommand = require('../lib/util/runSafeCommand');
const getEddiPersonalities = require('../lib/options/getEddiPersonalities');
const personalityToFiles = require('../lib/personality/personalityToFiles');
const writeJson = require('../lib/util/writeJson');
const log = require('../lib/log');
const { CONFIG_FILENAME, BATCH_FILES } = require('../lib/constants');

exports.command = 'init';

exports.describe = 'Creates files based for all personalities';

const OPTS = {
  ext: {
    type: 'string',
    desc: 'The extension to use when created EDDI template files',
    default: '.cottle',
    requestArg: true,
    question: 'What file extension should be used for the EDDI templates? ',
    validate: (ext) => /^[.a-z]*$/.test(ext),
    group: 'Init options:',
  },
  templateSettings: {
    alias: ['settings', 's'],
    type: 'boolean',
    desc: 'Whether to include settings as comments in each template',
    default: false,
    requestArg: true,
    question: 'Add settings as comments to top of each template?',
    group: 'Init options:',
  },
  batchFiles: {
    alias: ['bat', 'b'],
    type: 'boolean',
    desc: "Whether to add batch files, so you can double-click a file instead of using a terminal",
    default: true,
    requestArg: true,
    question: 'Create batch files, so you can double-click a file instead of using a terminal?',
    group: 'Init options:',
  },
};
exports.builder = OPTS;

function normalizeExt(ext) {
  return `.${ext}`.replace('..', '.');
}

function createBatchFile(command) {
  const content = `call npx eddi-cli ${command}
pause`;
  log.verbose(`> Creating "${command}.bat" file.`);
  return fs.writeFile(path.join(process.cwd(), `${command}.bat`), content, 'utf-8');
}

async function init(argv) {
  const args = await askQuestions(argv, OPTS);

  log();
  log.options(args, OPTS);

  args.ext = normalizeExt(args.ext);

  log('Reading personalities');
  const personalities = await getEddiPersonalities();

  log('Writing personalities');
  await Object.values(personalities).reduce((p, personality) => {
    log('> Writing ' + log.c.em(personality.name) + '.');
    if (!p) {
      return personalityToFiles(personality, args);
    }
    return p.then(() => personalityToFiles(personality, args));
  }, null);

  log('Writing other files');
  log.verbose('> Adding "README.md" with info about EDDI CLI.')
  await fs.copyFile(path.resolve(__dirname, '../template/README.md'), path.join(process.cwd(), 'README.md'));
  log.verbose('> Adding "eddi-cli.config.json" to store chosen project configuration.')
  await writeJson(path.join(process.cwd(), CONFIG_FILENAME), {
    extension: args.ext,
    templateSettings: args.templateSettings,
  });

  if (args.batchFiles) {
    await Promise.all(BATCH_FILES.map(createBatchFile));
  }

  log();
  log('DONE');
}

exports.handler = async function initCommand(argv) {
  await runSafeCommand(init, argv);
}
