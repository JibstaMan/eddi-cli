const fs = require('fs/promises');

async function writeJson(filePath, json) {
  return await fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf-8');
}

module.exports = writeJson;
