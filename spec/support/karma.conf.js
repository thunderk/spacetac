// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '../..',
    frameworks: ['jasmine'],
    singleRun: true,
    browsers: ['PhantomJS'],
    reporters: ['dots', 'coverage'],
    logLevel: config.LOG_WARN,

    preprocessors: {
      'out/build.js': ['coverage']
    },
    coverageReporter: {
      type: 'json',
      dir: 'out/coverage/',
      subdir: '.',
      file: 'coverage.json'
    },

    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'out/vendor/phaser/build/phaser.js',
      'out/vendor/parse/parse.min.js',
      'out/build.js'
    ]
  })
}
