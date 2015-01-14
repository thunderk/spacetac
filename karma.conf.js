// Configuration for running unit testing using karma
module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            'src/vendor/phaser-official/build/phaser.js',
            'build/main.js'
        ],
        client: {
            captureConsole: false
        },
        logLevel: config.LOG_WARN,
        browsers: ['PhantomJS'],
        singleRun: true,
        reporters: ['progress', 'coverage'],
        preprocessors: {'build/main.js': ['coverage']}
    });
};
