function getPersonalityOptionFromPersonalities(personalities) {
  const personality = {
    alias: 'p',
    type: 'string',
    choices: personalities.map((p) => p.choiceValue),
    requestArg: true,
    questionChoices: personalities,
  };

  if (personalities.length === 1) {
    const p = personalities[0];

    personality.choices = personalities;
    personality.default = p;
    personality.defaultDescription = p.choiceValue;
    personality.requestArg = false;
    personality.hidden = true;
  }
  return personality;
}

module.exports = getPersonalityOptionFromPersonalities;
