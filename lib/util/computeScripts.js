function zipEntries(entries) {
  return entries.reduce((acc, [key, val]) => {
    acc[key] = val;
    return acc;
  }, {});
}

/**
 * @typedef {Object} Script
 * @property {string} name The name of the script
 * @property {string} script The path to the file containing the content of the script
 */

/**
 * Performs an async computation on all scripts, while keeping the same data structure.
 *
 * @param {Object.<string, Script>} scripts The object containing the scripts
 * @param {function(Script): Promise<Script>} compute The function to execute for each script
 * @returns {Promise<Object.<string, Script>>} The object containing the updated scripts
 */
async function computeScripts(scripts, compute) {
  const scriptEntries = await Promise.all(
    Object.entries(scripts).map(([key, script]) => {
      return compute(script)
        .then((updatedScript) => [key, updatedScript]);
    })
  );
  return zipEntries(scriptEntries);
}

module.exports = computeScripts;
