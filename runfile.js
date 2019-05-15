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

let forever = () => new Promise(() => null);

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
async function exec(command) {
    await run(command, { async: true });
}

/**
 * Build app from typescript sources
 */
async function ts() {
    console.log("Building app...");
    await exec(`tsc --build config/app.json config/tests.json`);
}

/**
 * Start watching for typescript changes
 */
async function watch_ts() {
    await exec(`tsc --build config/app.json config/tests.json --watch --preserveWatchOutput`);
}

/**
 * Build an atlas of images for a given stage
 */
async function atlas(stage) {
    shell.rm('-f', `out/assets/atlas${stage}-*`);

    let files = await list(`data/stage${stage}/image/**/*.{png,jpg}`);

    let opts = {
        name: `out/assets/atlas${stage}`,
        fullpath: true,
        width: 2048,
        height: 2048,
        square: true,
        powerOfTwo: true,
        padding: 2
    };
    await new Promise(resolve => gfPacker(files, opts, resolve));
    let outfiles = await list(`out/assets/atlas${stage}-*.json`);
    return outfiles.map(file => path.basename(file).replace('.json', ''));
}

/**
 * Build a single data pack
 */
async function pack(stage) {
    console.log(`Building pack ${stage}...`);

    let getKey = x => x.replace(/\//g, "-").replace(/\.[a-z0-9]+$/, '');

    let files = await atlas(stage)
    let items = files.map(file => {
        let fname = path.basename(file);
        return {
            type: "atlas",
            key: fname,
            atlasURL: `assets/${fname}.json?t=${Date.now()}`,
            textureURL: `assets/${fname}.png`
        }
    });

    files = await list(`data/stage${stage}/sound/**/*.{mp3,wav}`);
    items = items.concat(files.map(file => {
        const [name, ext] = file.rsplit('.');
        const key = getKey(name.replace(`data/stage${stage}/sound/`, ''));
        shell.cp(file, `out/assets/${key}.${ext}`);
        return {
            type: "audio",
            key: key,
            url: `assets/${key}.${ext}?t=${Date.now()}`,
            autoDecode: (ext == 'mp3')
        };
    }));

    files = await list(`data/stage${stage}/shader/**/*.glsl`);
    items = items.concat(files.map(file => {
        const [name, ext] = file.rsplit('.');
        const key = getKey(name.replace(`data/stage${stage}/shader/`, ''));
        shell.cp(file, `out/assets/${key}.${ext}`);
        return {
            type: "shader",
            key: key,
            url: `assets/${key}.${ext}?t=${Date.now()}`
        };
    }));

    let packdata = {};
    packdata[`stage${stage}`] = { files: items };
    await new Promise(resolve => fs.writeFile(`out/assets/pack${stage}.json`, JSON.stringify(packdata), 'utf8', resolve));
}

/**
 * Build data packs
 */
async function data() {
    shell.mkdir("-p", "out/assets");
    await Promise.all([1, 2, 3].map(stage => pack(stage)));
}

/**
 * Start watch for data changes
 */
async function watch_data() {
    watch(["./data/**/*.*"], () => data());
    await forever();
}

/**
 * Copy and concatenate the vendors from node_modules to out/dependencies.js
 */
async function dependencies() {
    console.log("Bundling dependencies...");
    const self = JSON.parse(fs.readFileSync("package.json"));
    const deps = Object.keys(self["dependenciesMap"]).map(dependency => `node_modules/${dependency}/${self["dependenciesMap"][dependency]}`);
    const bundle = shell.cat(deps);
    fs.writeFileSync("out/dependencies.js", bundle);
}

/**
 * Start watching for dependencies changes
 */
async function watch_dependencies() {
    watch(['package.json'], () => dependencies());
    await forever();
}

/**
 * Trigger a single build
 */
async function build() {
    await Promise.all([
        ts(),
        data(),
        dependencies()
    ]);
}

/**
 * Optimize the build for production
 */
async function optimize() {
    // TODO do not overwrite dev build
    await exec("uglifyjs out/app.js --source-map --ecma 6 --mangle --keep-classnames --compress --output out/app.js");
}

/**
 * Deploy to production
 */
async function deploy(task, experimental = false) {
    await build();
    await optimize();
    await exec(`rsync -avz --delete ./out/ hosting.thunderk.net:/srv/website/spacetac${experimental ? "x" : ""}/`);
}

/**
 * Deploy to production (experimental)
 */
async function deployx(task) {
    await deploy(task, true);
}

/**
 * Run tests in karma
 */
async function karma() {
    await exec("karma start spec/support/karma.conf.js");
}

/**
 * Run tests in karma (suppose is already built)
 */
async function test(task) {
    console.log("Running tests...");
    await karma();
}

/**
 * Run tests in karma when the build changes
 */
async function watch_test(task) {
    watch(["out/*.js", "out/*.html", "spec/support/*"], () => karma());
    await forever();
}

/**
 * Run tests in karma, using freshly built app (for continuous integration)
 */
async function ci(task) {
    await Promise.all([ts(), dependencies()]);
    await karma();
    await exec("remap-istanbul -i out/coverage/coverage.json -o out/coverage -t html");
}

/**
 * Serve the app for dev purpose
 */
async function serve() {
    liveServer.start({
        host: '127.0.0.1',
        port: 8012,
        root: 'out',
        ignore: 'out/coverage',
        mount: [
            ['/jasmine', './node_modules/jasmine-core/lib/jasmine-core']
        ],
        wait: 500
    });
    await new Promise(() => null);
}

/**
 * Continuous development server
 */
async function continuous() {
    try {
        await build();
    } catch (err) {
        console.error(err);
    }

    await Promise.all([
        serve(),
        watch_ts(),
        watch_data(),
        watch_dependencies(),
        watch_test(),
    ]);
}

/**
 * Sends code coverage to codecov service
 */
async function codecov() {
    await exec("remap-istanbul -i out/coverage/coverage.json -o out/coverage/mapped.json -t json");
    await exec("codecov -f out/coverage/mapped.json");
}

/**
 * Wrapper around an async execution function, to make it a runjs command
 */
function command(func) {
    return async function () {
        try {
            await func();
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    }
}

module.exports = {
    ts: command(ts),
    watch_ts: command(watch_ts),
    data: command(data),
    watch_data: command(watch_data),
    dependencies: command(dependencies),
    watch_dependencies: command(watch_dependencies),
    build: command(build),
    test: command(test),
    watch_test: command(watch_test),
    deploy: command(deploy),
    deployx: command(deployx),
    serve: command(serve),
    continuous: command(continuous),
    ci: command(ci),
    codecov: command(codecov),
}
