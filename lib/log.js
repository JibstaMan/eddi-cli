
const log = console.log.bind(console);

log.error = console.error.bind(console);

log.printVerbose = false;
log.verbose = function logVerbose(...args) {
  if (log.printVerbose) {
    console.log(...args);
  }
}

log.options = function logOptions(args, opts) {
  log.verbose(Object.keys(opts).reduce((acc, key) => {
    return acc + `\n${key}: ${args[key]}`;
  }, 'Options:'));
  log.verbose();
}

module.exports = log;
