
const log = console.log.bind(console);
log.printVerbose = false;
log.verbose = function verbose(...args) {
  if (log.printVerbose) {
    console.log(...args);
  }
}

module.exports = log;
