// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '../..',
    frameworks: ['jasmine'],
    singleRun: true,
    browsers: ['ChromeHeadless'],
    colors: true,
    reporters: ['spec', 'coverage'],
    logLevel: config.LOG_WARN,

    client: {
      captureConsole: false
    },

    preprocessors: {
      'out/build.js': ['coverage']
    },

    coverageReporter: {
      type: 'json',
      dir: 'out/coverage/',
      subdir: '.',
      file: 'coverage.json'
    },

    specReporter: {
      showSpecTiming: true,
      suppressPassed: true
    },

    files: [
      'out/vendor/phaser/phaser.js',
      'out/vendor/parse/parse.min.js',
      'out/build.js'
    ]
  })
}
