const gulp = require("gulp");
const clean = require("gulp-clean");
const imagemin = require("gulp-imagemin");
const jsonMinify = require("gulp-json-minify");
const minifyHTML = require("gulp-minify-html");
const minifyCSS = require("gulp-clean-css");
var minimist = require('minimist');

var knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'production' }
};

var options = minimist(process.argv.slice(2), knownOptions);

const devBuild = options.env === "development";

let settings;
if (devBuild) {
  settings = {
    dest: "./build/debug",
    res: "./build/debug",
  };
} else {
  settings = {
    dest: "./build/release",
    res: "./dist/inlined",
  };
}

function buildHtml() {
  return gulp
    .src("./src/html/index.html")
    .pipe(minifyHTML())
    .pipe(gulp.dest(settings.dest));
}

function buildCss() {
  return gulp
    .src("./src/css/*.css")
    .pipe(minifyCSS())
    .pipe(gulp.dest(settings.dest));
}

function cleanPng() {
  return gulp
    .src([`${settings.res}/*.png`, `${settings.dest}/*.png`], {
      read: false,
    })
    .pipe(clean());
}
function buildPng() {
  return gulp
    .src("src/res/*.png")
    .pipe(imagemin([imagemin.optipng({ optimizationLevel: 7 })]))
    .pipe(gulp.dest(settings.dest))
    .pipe(gulp.dest(settings.res));
}

function cleanJson() {
  return gulp
    .src([`${settings.res}/*.json`, `${settings.dest}/*.json`], {
      read: false,
    })
    .pipe(clean());
}

function buildJson() {
  return gulp
    .src("src/res/*.json")
    .pipe(jsonMinify())
    .pipe(gulp.dest(settings.dest))
    .pipe(gulp.dest(settings.res));
}

function watch() {
  gulp.watch(["./src/res/*.png"], gulp.series(cleanPng, buildPng));
  gulp.watch(["./src/res/*.json"], gulp.series(cleanJson, buildJson));
  gulp.watch(["./src/html/index.html"], buildHtml);
  gulp.watch(["./src/css/*.css"], buildCss);
}

const build = exports.build = gulp.parallel(gulp.series(cleanPng, buildPng), gulp.series(cleanJson, buildJson), buildHtml, buildCss);

exports.watch = gulp.series(build, watch); 