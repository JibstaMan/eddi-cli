function getFromConfig(config, defaultValue, params) {
  if (typeof config === 'function') {
    return config(...params);
  }

  if (config === undefined) {
    return defaultValue;
  }
  return config;
}

module.exports = getFromConfig;
