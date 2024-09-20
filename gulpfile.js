/// <binding AfterBuild='wiredep' ProjectOpened='installTypings' />
var gulp = require('gulp'),
    args = require('yargs').argv,
    config = require('./gulp.config')(),
    $ = require('gulp-load-plugins')({ lazy: true }),
    tsc = require('gulp-typescript'),
    args = require('yargs').argv,
    gulpif = require('gulp-if'),
    concat = require('gulp-concat'),
    bower = require('gulp-bower'),
    mainBowerFiles = require('main-bower-files'),
    using = require('gulp-using'),
    del = require('del'),
    runSequence = require('run-sequence'),
    sourcemaps = require('gulp-sourcemaps'),
    tsProject = tsc.createProject('tsconfig.json'),
    gulpTypings = require("gulp-typings"),
    rename = require("gulp-rename"),
    ga = require("gulp-ga"),
    cacheBuster = require("gulp-cache-bust");

    isStaging = args.mode === "StagingTAV1",
    isRC = args.mode === "RC",
    isProduction = args.mode === "Production" || args.mode === "Release",
    isRelease = isStaging || isRC || isProduction,
    isDebug = !isStaging && !isRC && !isProduction;

gulp.task('clean',
    function () {
        return del([
            "./app*/**/*.js",
            "./app*/**/*.js.map",
            "./app*/index.html",
            "./lib",
            "./bin",
            "./typings",
            "index.html"
        ]).then(paths => {
            console.log('Deleted files and folders:\n', paths.join('\n'));

        }).then(() => bower({ cmd: 'install' }));       //make this one consession: WebCompiler breaks after clean if bower packages are missing

    });

gulp.task('bower',
    function() {
        return bower({ cmd: 'install' });
    });

gulp.task('wiredep-debug-common',
    function () {
        var options = config.getWiredepDefaultOptions();
        var wiredep = require('wiredep').stream;

        return gulp
            .src(config.indexSourceAppCommon)
            .pipe($.inject(gulp.src(config.jsDebugFilesToDeployCommon)))
            .pipe(cacheBuster({ type: 'timestamp' }))
            .pipe(wiredep(options))
            .pipe(rename("index.html"))
            .pipe(gulp.dest(config.indexDestinationAppCommon));
    });

gulp.task('wiredep-debug-customer',
    function () {
        var options = config.getWiredepDefaultOptions();
        var wiredep = require('wiredep').stream;

        return gulp
            .src(config.indexSourceAppCustomer)
            .pipe($.inject(gulp.src(config.jsDebugFilesToDeployCustomer)))
            .pipe(cacheBuster({ type: 'timestamp' }))
            .pipe(wiredep(options))
            .pipe(rename("index.html"))
            .pipe(gulp.dest(config.indexDestinationAppCustomer));
    });

gulp.task('wiredep-debug-staff',
    function () {
        var options = config.getWiredepDefaultOptions();
        var wiredep = require('wiredep').stream;

        return gulp
            .src(config.indexSourceAppStaff)
            .pipe($.inject(gulp.src(config.jsDebugFilesToDeployStaff)))
            .pipe(cacheBuster({ type: 'timestamp' }))
            .pipe(wiredep(options))
            .pipe(rename("index.html"))
            .pipe(gulp.dest(config.indexDestinationAppStaff));
    });

gulp.task('wiredep-production-common',
    function () {
        var options = config.getWiredepProductionOptions();
        var wiredep = require('wiredep').stream;

        return gulp
            .src(config.indexSourceAppCommon)
            .pipe(ga({ url: 'app.valeta-app.com', uid: 'UA-78542344-1', sendPageView: false }))
            .pipe($.inject(gulp.src(isRelease ? config.jsProductionIncludes : config.jsStagingFilesToDeployCommon)))
            .pipe(cacheBuster({ type: 'timestamp' }))
            .pipe(wiredep(options))
            .pipe(rename("index.html"))
            .pipe(gulp.dest(config.indexDestinationAppCommon));
    });
gulp.task('wiredep-production-customer',
    function () {
        var options = config.getWiredepProductionOptions();
        var wiredep = require('wiredep').stream;

        return gulp
            .src(config.indexSourceAppCustomer)
            .pipe(ga({ url: 'app.valeta-app.com', uid: 'UA-78542344-1', sendPageView: false }))
            .pipe($.inject(gulp.src(isRelease ? config.jsProductionIncludes : config.jsStagingFilesToDeployCustomer)))
            .pipe(cacheBuster({ type: 'timestamp' }))
            .pipe(wiredep(options))
            .pipe(rename("index.html"))
            .pipe(gulp.dest(config.indexDestinationAppCustomer));
    });

gulp.task('wiredep-production-staff',
    function () {
        var options = config.getWiredepProductionOptions();
        var wiredep = require('wiredep').stream;

        return gulp
            .src(config.indexSourceAppStaff)
            .pipe(ga({ url: 'app.valeta-app.com', uid: 'UA-78542344-1', sendPageView: false }))
            .pipe($.inject(gulp.src(isRelease ? config.jsProductionIncludes : config.jsStagingFilesToDeployStaff)))
            .pipe(cacheBuster({ type: 'timestamp' }))
            .pipe(wiredep(options))
            .pipe(rename("index.html"))
            .pipe(gulp.dest(config.indexDestinationAppStaff));
    });

gulp.task('compile-ts-debug', function () {
    var sourceTsFiles = config.tsDebugSourceFiles;

    var tsResult = gulp.src(sourceTsFiles, { base: "./" })
                       .pipe(sourcemaps.init())
                       .pipe(tsc(tsProject));

    tsResult.dts.pipe(gulp.dest("./"));
    return tsResult.js
                    .pipe(sourcemaps.write("./"))
                    .pipe(gulp.dest("./"));
});

gulp.task('compile-ts-staging', function () {
    var sourceTsFiles = config.tsStagingSourceFiles;

    var tsResult = gulp.src(sourceTsFiles, { base: "./" })
                       .pipe(sourcemaps.init())
                       .pipe(tsc(tsProject));

    tsResult.dts.pipe(gulp.dest("./"));
    return tsResult.js
                    .pipe(sourcemaps.write("./"))
                    .pipe(gulp.dest("./"));
});

gulp.task('compile-ts-rc', function () {
    var sourceTsFiles = config.tsRCSourceFiles;

    var tsResult = gulp.src(sourceTsFiles, { base: "./" })
        .pipe(sourcemaps.init())
        .pipe(tsc(tsProject));

    tsResult.dts.pipe(gulp.dest("./"));
    return tsResult.js
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("./"));
});

gulp.task('compile-ts-production', function () {
    var sourceTsFiles = config.tsProductionSourceFiles;

    var tsResult = gulp.src(sourceTsFiles, { base: "./" })
        .pipe(sourcemaps.init())
        .pipe(tsc(tsProject));

    tsResult.dts.pipe(gulp.dest("./"));
    return tsResult.js
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("./"));
});

gulp.task("installTypings", function () {
    var stream = gulp.src("./typings.json")
        .pipe(gulpTypings()); //will install all typingsfiles in pipeline.
    return stream; // by returning stream gulp can listen to events from the stream and knows when it is finished.
});

gulp.task("installTyping-Kendo",
    function() {
        var stream = gulp.src("./kendo/kendo.all.d.ts")
            .pipe(gulp.dest("./typings"));
        return stream;
    });

gulp.task("concatjs-appfiles-staging",
    function () {
        return gulp
            .src(config.jsStagingFilesToDeployALL)
            .pipe(concat('valeta-app.js'))
            .pipe(gulp.dest('./'));
    });

gulp.task("concatjs-appfiles-rc",
    function () {
        return gulp
            .src(config.jsRCFilesToDeployALL)
            .pipe(concat('valeta-app.js'))
            .pipe(gulp.dest('./'));
    });

gulp.task("concatjs-appfiles-production",
    function () {
        return gulp
            .src(config.jsProductionFilesToDeployALL)
            .pipe(concat('valeta-app.js'))
            .pipe(gulp.dest('./'));
    });

gulp.task("concatjs-libfiles",
    function () {
        return gulp
            .src(mainBowerFiles( [ '**/*.js' ]))
            .pipe(using())
            .pipe(concat('valeta-lib.js'))
            .pipe(gulp.dest('./'));
    });

console.log("isStaging = " + isStaging);
console.log("isRC = " + isRC);
console.log("isProduction = " + isProduction);
console.log("isRelease = " + isRelease);
console.log("isDebug = " + isDebug);

gulp.task("build",
    function (callback) {
        if (isDebug) {
            gulp.start('build-debug');
            return;
        }
        if (isStaging) {
            gulp.start('build-staging');
            return;
        }
        if (isRC) {
            gulp.start('build-rc');
            return;            
        }
        if (isProduction) {
            gulp.start('build-production');
            return;
        }
    });

gulp.task("build-debug",
    function(callback) {
        runSequence('bower',
            'installTypings',
            'compile-ts-debug',
            'wiredep-debug-common',
            'wiredep-debug-customer',
            'wiredep-debug-staff',
            callback);
    });

gulp.task("build-staging",
    function (callback) {
        runSequence('bower',
            'installTypings',
            'compile-ts-staging',
            ['concatjs-libfiles','concatjs-appfiles-staging'],
            'wiredep-production-common',
            'wiredep-production-customer',
            'wiredep-production-staff',
            callback);
    });

gulp.task("build-rc",
    function (callback) {
        runSequence('bower',
            'installTypings',
            'compile-ts-rc',
            ['concatjs-libfiles', 'concatjs-appfiles-rc'],
            'wiredep-production-common',
            'wiredep-production-customer',
            'wiredep-production-staff',
            callback);
    });

gulp.task("build-production",
    function (callback) {
        runSequence('bower',
            'installTypings',
            'compile-ts-production',
            ['concatjs-libfiles', 'concatjs-appfiles-production'],
            'wiredep-production-common',
            'wiredep-production-customer',
            'wiredep-production-staff',
            callback);
    });