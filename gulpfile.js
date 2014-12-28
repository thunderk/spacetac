var gulp = require('gulp'),
  ts = require('gulp-typescript'),
  less = require('gulp-less'),
  minifyCSS = require('gulp-minify-css'),
  concat = require('gulp-concat-sourcemap'),
  sourcemaps = require('gulp-sourcemaps'),
  processhtml = require('gulp-processhtml'),
  connect = require('gulp-connect'),
  open = require('gulp-open'),
  del = require('del'),
  uglify = require('gulp-uglifyjs'),
  deploy = require('gulp-gh-pages'),
  runSequence = require('run-sequence');

var paths = {
  assets: 'src/assets/**/*',
  less: 'src/css/main.less',
  index: 'src/index.html',
  libs: [
    'src/vendor/phaser-official/build/phaser.min.js'
  ],
  ts: 'src/scripts/**/*.ts',
  build: './build/',
  dist: './dist/'
};

gulp.task('clean', function (cb) {
  return del([paths.build, paths.dist], cb);
});

gulp.task('copy', function () {
  return gulp.src(paths.assets)
    .pipe(gulp.dest(paths.dist + 'assets'));
});

var tsProject = ts.createProject({
  declarationFiles: true,
  noExternalResolve: true,
  sortOutput: true,
  sourceRoot: '../scripts'
});

gulp.task('typescript', function () {
  var tsResult = gulp.src(paths.ts)
    .pipe(sourcemaps.init())
    .pipe(ts(tsProject));

  return tsResult.js
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.build));
});

gulp.task('less', function () {
  return gulp.src(paths.less)
    .pipe(less())
    .pipe(gulp.dest(paths.build));
});

gulp.task('processhtml', function () {
  return gulp.src(paths.index)
    .pipe(processhtml())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('reload', ['typescript'], function () {
  gulp.src('src/*.html')
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(paths.ts, ['typescript', 'reload']);
  gulp.watch(paths.less, ['less', 'reload']);
  gulp.watch(paths.index, ['reload']);
});

gulp.task('connect', function () {
  connect.server({
    root: [__dirname + '/src', paths.build],
    port: 9000,
    livereload: true
  });
});

gulp.task("open", function () {
  gulp.src(paths.index)
    .pipe(open("", {url: "http://localhost:9000"}));
});

gulp.task('minifyJs', ['typescript'], function () {
  return gulp.src(paths.libs.concat(paths.build + 'main.js'))
    .pipe(uglify('all.min.js', {outSourceMap: false}))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('minifyCss', ['less'], function () {
  return gulp.src(paths.build + 'main.css')
    .pipe(minifyCSS())
    .pipe(gulp.dest(paths.dist))
});

gulp.task('deploy', function () {
  return gulp.src('./dist/**/*')
    .pipe(deploy());
});

gulp.task('default', function() {
  runSequence('clean', ['typescript', 'less', 'connect', 'watch'], 'open');
});
gulp.task('build', function() {
  return runSequence('clean', ['typescript', 'less', 'copy', 'minifyJs', 'minifyCss', 'processhtml']);
});
