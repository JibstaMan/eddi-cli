const path = require('path');

function getChoiceOption(personality, folder) {
  return {
    value: folder,
    name: `${personality.name} (${path.basename(folder)})`,
    choiceValue: path.basename(folder),
    choiceName: personality.name,
  };
}

module.exports = getChoiceOption;
