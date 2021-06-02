const colors = require('colors/safe');

colors.setTheme({
  error: 'red',
  warn: 'yellow',
  debug: 'gray',
  em: 'cyan',
});

function logAt(args, level) {
  return args.map((val) => colors[level](val))
}

const log = console.log.bind(console);

log.error = (...args) => console.error(...logAt(args, 'error'));
log.warn = (...args) => console.warn(...logAt(args, 'warn'));
log.em = (message) => colors.em(message);

log.printVerbose = false;
log.verbose = function logVerbose(...args) {
  if (log.printVerbose) {
    console.log(...logAt(args, 'debug'));
  }
}

log.options = function logOptions(args, opts) {
  log.verbose(Object.keys(opts).reduce((acc, key) => {
    const val = (typeof args[key] === 'object') ? JSON.stringify(args[key], null, 2) : args[key];
    return acc + `\n${key}: ${val}`;
  }, 'Options:'));
  log.verbose();
}

module.exports = log;
