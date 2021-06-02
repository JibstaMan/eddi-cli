const path = require('path');

function normalizePersonality(personality, root = process.cwd()) {
  if (typeof personality === 'object') {
    return personality.value;
  }
  if (path.isAbsolute(personality)) {
    return personality;
  }
  // when using -p ..., personality is only the folder name.
  return path.join(root, personality);
}

module.exports = normalizePersonality;
