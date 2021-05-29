const inquirer = require('inquirer');

function getType(option) {
  if (option.choices) {
    return 'list';
  }
  if (option.type === 'number') {
    return 'number';
  }
  if (option.type === 'boolean') {
    return 'confirm';
  }
  return 'input';
}

async function askQuestions(argv, options) {
  const questions = Object.entries(options).reduce((acc, [key, option]) => {
    const hasDefaulted = argv.defaulted[key] === true;
    if (!option.requestArg || (!hasDefaulted && argv[key])) {
      return acc;
    }
    acc.push({
      type: getType(option),
      name: key,
      message: option.question,
      choices: option.choices,
      validate: option.validate,
      default: option.default,
    });
    return acc;
  }, []);

  if (!questions.length) {
    return argv;
  }

  const answers = await inquirer.prompt(questions);

  return Object.assign({}, argv, answers);
}

module.exports = askQuestions;
