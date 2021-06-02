const fs = require('fs/promises');

async function readJson(filePath) {
  const fileContent = await fs.readFile(filePath, 'utf-8');

  let jsonContent = fileContent;
  if (jsonContent[0] !== '{') {
    // remove BOM character as part of utf-8 with BOM encoding that EDDI uses
    jsonContent = fileContent.slice(1);
  }

  return JSON.parse(jsonContent);
}

module.exports = readJson;
