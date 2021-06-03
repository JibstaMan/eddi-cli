const getEddiPersonalities = require('./getEddiPersonalities');
const getChoiceOption = require('./util/getChoiceOption');
const getPersonalityOptionFromPersonalities = require('./util/getPersonalityOptionFromPersonalities');

async function getEddiPersonalityOption() {
  const personalities = await getEddiPersonalities({ skipDefault: true, checkCwd: true });
  const personalityChoices = Object.values(personalities).map((personality) => {
    return getChoiceOption(personality, personality.filePath);
  });

  return getPersonalityOptionFromPersonalities(personalityChoices);
}

module.exports = getEddiPersonalityOption;
