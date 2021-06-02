const log = require('../log');

const { ERROR_CODES } = require('../constants');

async function runSafeCommand(func, argv) {
  try {
    await func(argv);
  }
  catch (e) {
    log.error(e.message);
    log.verbose(e.stack);
    process.exit(ERROR_CODES.GENERIC_ERROR);
  }
}

module.exports = runSafeCommand;
