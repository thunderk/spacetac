// Configuration for running unit testing using karma
module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            'src/vendor/jasmine/lib/jasmine-core/jasmine.js',
            'src/vendor/jasmine/lib/jasmine-core/jasmine-html.js',
            'src/vendor/jasmine/lib/jasmine-core/boot.js',
            'src/vendor/phaser-official/build/phaser.js',
            'build/main.js'
        ],
        browsers: ['PhantomJS'],
        singleRun: true,
        reporters: ['progress', 'coverage'],
        preprocessors: {'build/main.js': ['coverage']}
    });
};
