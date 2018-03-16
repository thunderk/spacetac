'use strict';

const path = require('path');
const fs = require('fs');
const { run } = require('runjs');
const glob = require('glob');
const watch = require('glob-watcher');
const shell = require('shelljs');
const liveServer = require('live-server');
const gfPacker = require('gamefroot-texture-packer');

String.prototype.rsplit = function (sep, maxsplit) {
    var split = this.split(sep);
    return maxsplit ? [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit)) : split;
}

/**
 * Promise-compatible version of glob
 */
function list(pattern) {
    return new Promise((resolve, reject) => {
        glob(pattern, (err, files) => (err) ? reject(err) : resolve(files));
    });
}

/**
 * Asynchronous execution of shell commands
 */
function exec(command) {
    return run(command, { async: true });
}

/**
 * Build app from typescript sources
 */
function ts(dist = false) {
    console.log("Building app...");
    return exec(`tsc -p ${dist ? "./tsconfig.dist.json" : "."}`);
}

/**
 * Start watching for typescript changes
 */
function watch_ts() {
    watch(["./src/**/*.ts", "package.json"], () => ts());
}

/**
 * Build an atlas of images for a given stage
 */
function atlas(stage) {
    shell.rm('-f', `out/assets/atlas${stage}-*`);
    return list(`data/stage${stage}/image/**/*.{png,jpg}`).then(files => {
        let opts = {
            name: `out/assets/atlas${stage}`,
            fullpath: true,
            width: 1024,
            height: 1024,
            square: true,
            powerOfTwo: true,
            trim: true,
            padding: 2
        };
        return new Promise(resolve => gfPacker(files, opts, resolve));
    }).then(() => {
        return list(`out/assets/atlas${stage}-*.json`);
    }).then(outfiles => {
        return Promise.resolve(outfiles.map(file => path.basename(file).replace('.json', '')))
    });
}

/**
 * Build a single data pack
 */
function pack(stage) {
    console.log(`Building pack ${stage}...`);

    let getKey = x => x.replace(/\//g, "-").replace(/\.[a-z0-9]+$/, '');

    return atlas(stage).then(files => {
        return Promise.resolve(files.map(file => {
            let fname = path.basename(file);
            return {
                type: "atlasJSONHash",
                key: fname,
                atlasURL: `assets/${fname}.json?t=${Date.now()}`,
                textureURL: `assets/${fname}.png`,
                atlasData: null
            }
        }));
    }).then(items => {
        return list(`data/stage${stage}/sound/**/*.{mp3,wav}`).then(files => {
            return Promise.resolve(items.concat(files.map(file => {
                const [name, ext] = file.rsplit('.');
                const key = getKey(name.replace(`data/stage${stage}/sound/`, ''));
                shell.cp(file, `out/assets/${key}.${ext}`);
                return {
                    type: "audio",
                    key: key,
                    urls: [`assets/${key}.${ext}?t=${Date.now()}`],
                    autoDecode: (ext == 'mp3')
                };
            })));
        });
    }).then(items => {
        return list(`data/stage${stage}/shader/**/*.glsl`).then(files => {
            return Promise.resolve(items.concat(files.map(file => {
                const [name, ext] = file.rsplit('.');
                const key = getKey(name.replace(`data/stage${stage}/shader/`, ''));
                shell.cp(file, `out/assets/${key}.${ext}`);
                return {
                    type: "shader",
                    key: key,
                    url: `assets/${key}.${ext}?t=${Date.now()}`
                };
            })));
        });
    }).then(items => {
        let packdata = {};
        packdata[`stage${stage}`] = items;
        return new Promise(resolve => fs.writeFile(`out/assets/pack${stage}.json`, JSON.stringify(packdata), 'utf8', resolve));
    });
}

/**
 * Build data packs
 */
function data() {
    shell.mkdir("-p", "out/assets");
    return Promise.all([1, 2, 3].map(stage => pack(stage)));
}

/**
 * Start watch for data changes
 */
function watch_data() {
    watch(["./data/**/*.*"], () => data());
}

/**
 * Copy the vendors from node_modules to dist directory
 */
function vendors() {
    console.log("Copying vendors...");
    shell.rm('-rf', 'out/vendor');
    shell.mkdir('-p', 'out/vendor');
    shell.cp('-R', 'node_modules/phaser/build', 'out/vendor/phaser');
    shell.cp('-R', 'node_modules/parse/dist', 'out/vendor/parse');
    shell.cp('-R', 'node_modules/jasmine-core/lib/jasmine-core', 'out/vendor/jasmine');
    return Promise.resolve();
}

/**
 * Start watching for vendors changes
 */
function watch_vendors() {
    watch(['package.json'], () => vendors());
}

/**
 * Trigger a single build
 */
function build(dist = false) {
    return Promise.all([
        ts(dist),
        data(),
        vendors()
    ]);
}

/**
 * Optimize the build for production
 */
function optimize() {
    // TODO do not overwrite dev build
    return exec("uglifyjs out/build.dist.js --source-map --output out/build.js");
}

/**
 * Deploy to production
 */
function deploy(task) {
    return build(true).then(optimize).then(() => {
        return exec("rsync -avz --delete ./out/ hosting.thunderk.net:/srv/website/spacetac/")
    });
}

/**
 * Run tests in karma, using freshly built app
 */
function test(task) {
    return Promise.all([ts(), vendors()]).then(() => {
        return exec("karma start spec/support/karma.conf.js");
    }).then(() => {
        return exec("remap-istanbul -i out/coverage/coverage.json -o out/coverage -t html");
    });
}

/**
 * Serve the app for dev purpose
 */
function serve() {
    liveServer.start({
        host: '127.0.0.1',
        port: 8012,
        root: 'out',
        ignore: 'coverage',
        wait: 500
    });
    return new Promise(() => null);
}

/**
 * Continuous development server
 */
function continuous() {
    return build().then(() => Promise.all([
        serve(),
        watch_ts(),
        watch_data(),
        watch_vendors()
    ]));
}

module.exports = {
    ts,
    watch_ts,
    data,
    watch_data,
    vendors,
    watch_vendors,
    build,
    test,
    deploy,
    serve,
    continuous
}
