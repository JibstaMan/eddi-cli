const getLocalPersonalities = require('./getLocalPersonalities');
const getPersonalityOptionFromPersonalities = require('./util/getPersonalityOptionFromPersonalities');
const log = require('../log');
const { ERROR_CODES } = require('../constants');

async function getLocalPersonalityOption() {
  const personalities = await getLocalPersonalities(process.cwd());
  if (personalities.length === 0) {
    log.error("Ensure that you're using `eddi-cli` inside the folder containing the personality folders.");
    log.error(`No personalities found in "${process.cwd()}".`);
    process.exit(ERROR_CODES.NO_PERSONALITIES);
  }

  return getPersonalityOptionFromPersonalities(personalities);
}

module.exports = getLocalPersonalityOption;
