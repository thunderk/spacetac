const liveServer = require('live-server');

function shell(task, cmd) {
    return task.source(".").shell(cmd);
}

module.exports = {
    *serve(task) {
        liveServer.start({
            host: '127.0.0.1',
            port: 8012,
            root: 'out',
            ignore: 'coverage',
            wait: 500
        });
        return new Promise(() => null);
    },

    *vendors(task) {
        yield shell(task, "rm -rf out/vendor");
        yield shell(task, "mkdir -p out/vendor");
        yield shell(task, "cp -r node_modules/phaser/build out/vendor/phaser");
        yield shell(task, "cp -r node_modules/parse/dist out/vendor/parse");
        yield shell(task, "cp -r node_modules/jasmine-core/lib/jasmine-core out/vendor/jasmine");
    },

    *watch_vendors(task) {
        yield task.watch("package.json", ["vendors"]);
    },

    *ts(task) {
        yield shell(task, "tsc -p .");
    },

    *watch_ts(task) {
        yield task.watch(["src/**/*.ts", "tsconfig.json"], ["ts"]);
    },

    *atlas(task) {
        yield shell(task, "rm -f out/assets/atlas*");
        yield shell(task, "find graphics/exported -name '*.png' -print0 | xargs -0 gf-pack --name out/assets/atlas --fullpath --width 1024 --height 1024 --square --powerOfTwo --trim --padding 2");
    },

    *watch_atlas(task) {
        yield task.watch("graphics/exported/**/*.png", ["atlas"]);
    },

    *build(task) {
        yield task.parallel(['ts', 'atlas', 'vendors']);
    },

    *optimize(task) {
        yield shell(task, "uglifyjs out/build.js --source-map --output out/build.min.js");
    },

    *deploy(task) {
        yield task.serial(['build', 'optimize']);
        yield shell(task, "rsync -avz --delete ./out/ hosting.thunderk.net:/srv/website/spacetac/");
    },

    *karma(task) {
        yield shell(task, "karma start spec/support/karma.conf.js");
    },

    *test(task) {
        yield task.serial(['build', 'karma']);
        yield shell(task, "remap-istanbul -i out/coverage/coverage.json -o out/coverage -t html");
    },

    *default(task) {
        yield task.start('build');
        yield task.parallel(['serve', 'watch_ts', 'watch_atlas', 'watch_vendors']);
    }
}
