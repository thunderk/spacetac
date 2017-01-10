// karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: '../..',
    frameworks: ['jasmine'],
    singleRun: true,
    browsers: ['PhantomJS'],
    reporters: ['dots'],
    logLevel: config.LOG_WARN,

    files: [
      'out/vendor/phaser/build/phaser.js',
      'out/build.js'
    ]
  })
}