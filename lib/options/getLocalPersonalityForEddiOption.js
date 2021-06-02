const getLocalPersonalities = require('./getLocalPersonalities');
const getPersonalityOptionFromPersonalities = require('./util/getPersonalityOptionFromPersonalities');

function getChoices(eddiOption, personalities, answers) {
  return personalities.filter((personality) => {
    const eddiChoice = (eddiOption.default)
      ? eddiOption.default
      : eddiOption.questionChoices.find((opt) => opt.value === answers.personality);

    return personality.choiceName === eddiChoice.choiceName;
  });
}

async function getLocalPersonalityForEddiOption(eddiOption) {
  const personalities = await getLocalPersonalities(process.cwd());

  const option = getPersonalityOptionFromPersonalities(personalities);
  return {
    ...option,
    alias: ['local', 'l'],
    hidden: true,
    choices: personalities,
    questionChoices: (answers) => {
      return getChoices(eddiOption, personalities, answers);
    },
    when: (answers) => {
      const choices = getChoices(eddiOption, personalities, answers);
      return choices.length;
    },
  }
}

module.exports = getLocalPersonalityForEddiOption;
