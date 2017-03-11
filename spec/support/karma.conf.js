// karma.conf.js
module.exports = function(config) {
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
      type : 'json',
      dir : 'out/coverage/',
      subdir: '.',
      file: 'coverage.json'
    },

    files: [
      'out/vendor/phaser-ce/build/phaser.js',
      'out/build.js'
    ]
  })
}
