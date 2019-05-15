// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '../../out',
    frameworks: ['jasmine'],
    singleRun: true,
    browsers: ['ChromeHeadless'],
    colors: true,
    reporters: ['spec', 'coverage'],
    logLevel: config.LOG_ERROR,

    client: {
      captureConsole: false,
    },

    preprocessors: {
      'app.js': ['coverage']
    },

    coverageReporter: {
      type: 'json',
      dir: 'coverage',
      subdir: '.',
      file: 'coverage.json'
    },

    specReporter: {
      showSpecTiming: true,
      suppressPassed: true,
      suppressErrorSummary: true
    },

    files: [
      'dependencies.js',
      'app.js',
      'tests.js',
    ]
  })
}
