const inquirer = require('inquirer');

function getType(option) {
  if (option.choices) {
    return 'list';
  }
  return 'input';
}

async function askQuestions(argv, options) {
  const questions = Object.entries(options).reduce((acc, [key, option]) => {
    if (argv.defaulted[key] === false || !option.requestArg) {
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