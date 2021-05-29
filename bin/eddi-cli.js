#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const log = require('../lib/log');

const argv = yargs(hideBin(process.argv))
  .middleware((argv, yargs) => {
    argv.defaulted = yargs.parsed.defaulted;
    return argv;
  }, true)
  .middleware((argv) => {
    log.printVerbose = argv.verbose;
  })
  .option('verbose', {
    alias: 'v',
    desc: 'Whether to enable verbose logging',
    type: 'boolean',
    boolean: true,
    default: false,
  })
  .commandDir('../commands')
  .help()
  .group(['help', 'verbose', 'version'], 'General options:')
  .argv;