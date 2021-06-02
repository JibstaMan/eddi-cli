const getLocalPersonalities = require('./getLocalPersonalities');
const getPersonalityOptionFromPersonalities = require('./util/getPersonalityOptionFromPersonalities');

async function getLocalPersonalityForEddiOption(eddiOption) {
  const personalities = await getLocalPersonalities(process.cwd());

  const option = getPersonalityOptionFromPersonalities(personalities);
  return {
    ...option,
    alias: ['local', 'l'],
    hidden: true,
    choices: personalities,
    questionChoices: (answers) => {
      return personalities.filter((personality) => {
        const eddiChoice = (eddiOption.default)
          ? eddiOption.default
          : eddiOption.questionChoices.find((opt) => opt.value === answers.personality);

        return personality.choiceName === eddiChoice.choiceName;
      });
    },
  }
}

module.exports = getLocalPersonalityForEddiOption;
