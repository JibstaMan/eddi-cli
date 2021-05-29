const fs = require('fs/promises');

async function readJson(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

module.exports = readJson;
