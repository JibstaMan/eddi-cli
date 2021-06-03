const getEddiPersonalities = require('./getEddiPersonalities');
const getChoiceOption = require('./util/getChoiceOption');
const getPersonalityOptionFromPersonalities = require('./util/getPersonalityOptionFromPersonalities');
const log = require('../log');
const { ERROR_CODES } = require('../constants');

async function getEddiPersonalityOption() {
  const personalities = await getEddiPersonalities({ skipDefault: true, checkCwd: true });
  const personalityChoices = Object.values(personalities).map((personality) => {
    return getChoiceOption(personality, personality.filePath);
  });
  if (personalityChoices.length === 0) {
    log.error("It seems that you're using `eddi-cli` inside the folder containing a personality that doesn't exist in EDDI anymore, " +
      `or is one of the default ones.`);
    process.exit(ERROR_CODES.NO_PERSONALITIES);
  }

  return getPersonalityOptionFromPersonalities(personalityChoices);
}

module.exports = getEddiPersonalityOption;
