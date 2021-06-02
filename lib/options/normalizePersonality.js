const path = require('path');

function normalizePersonality(personality) {
  if (typeof personality === 'object') {
    return personality.value;
  }
  if (path.isAbsolute(personality)) {
    return personality;
  }
  // when using -p ..., personality is only the folder name.
  return path.join(process.cwd(), personality);
}

module.exports = normalizePersonality;
