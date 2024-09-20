module.exports = function () {
    var htmlTemplateSource = './html-template-source/';
    var siteRoot = './';
    var siteRootAppStaff = './appStaff/';
    var siteRootAppCustomer = './appCustomer/';

    var config = {
        indexSourceAppCommon: htmlTemplateSource + "index.appCommon.html",
        indexSourceAppCustomer: htmlTemplateSource + "index.appCustomer.html",
        indexSourceAppStaff: htmlTemplateSource + "index.appStaff.html",
        indexDestinationAppCommon: siteRoot,
        indexDestinationAppCustomer: siteRootAppCustomer,
        indexDestinationAppStaff: siteRootAppStaff,
        tsDebugSourceFiles: [
            './deployment/debug.ts',
            './appCommon/base/restClient.base.ts',
            './appCommon/base/**/*.ts',
            './appCommon/app.ts',
            './appCommon/mscorlib.js',
            './appCustomer/app.ts',
            './appStaff/app.ts',
            './app*/**/*.ts',
            './typings/index.d.ts'
        ],
        tsStagingSourceFiles: [
            './deployment/release.ts',
            './appCommon/base/restClient.base.ts',
            './appCommon/base/**/*.ts',
            './appCommon/app.ts',
            './appCommon/mscorlib.js',
            './appCustomer/app.ts',
            './appStaff/app.ts',
            './app*/**/*.ts',
            './typings/index.d.ts'
        ],
        tsRCSourceFiles: [
            './deployment/release.ts',
            './appCommon/base/restClient.base.ts',
            './appCommon/base/**/*.ts',
            './appCommon/app.ts',
            './appCommon/mscorlib.js',
            './appCustomer/app.ts',
            './appStaff/app.ts',
            './app*/**/*.ts',
            './typings/index.d.ts'
        ],
        tsProductionSourceFiles: [
            './deployment/release.ts',
            './appCommon/base/restClient.base.ts',
            './appCommon/base/**/*.ts',
            './appCommon/app.ts',
            './appCommon/mscorlib.js',
            './appCustomer/app.ts',
            './appStaff/app.ts',
            './app*/**/*.ts',
            './typings/index.d.ts'
        ],
        jsDebugFilesToDeployCommon: [
            './deployment/debug.js',
            './appCommon/base/restClient.base.js',
            './appCommon/base/**/*.js',
            './appCommon/app.js',
            './appCommon/mscorlib.js',
            './appCommon/**/*.js'
        ],
        jsDebugFilesToDeployCustomer: [
            './deployment/debug.js',
            './appCommon/base/restClient.base.js',
            './appCommon/base/**/*.js',
            './appCommon/app.js',
            './appCommon/mscorlib.js',
            './appCommon/mscorlib.js',
            './appCommon/**/*.js',
            './appCustomer/app.js',
            './appCustomer/**/*.js'
        ],
        jsDebugFilesToDeployStaff: [
            './deployment/debug.js',
            './appCommon/base/restClient.base.js',
            './appCommon/base/**/*.js',
            './appCommon/app.js',
            './appCommon/mscorlib.js',
            './appCommon/**/*.js',
            './appStaff/app.js',
            './appStaff/**/*.js'
        ],
        jsStagingFilesToDeployCommon: [
            './valeta-lib.js',
            './deployment/release.js',
            './appCommon/base/restClient.base.js',
            './appCommon/base/**/*.js',
            './appCommon/app.js',
            './appCommon/mscorlib.js',
            './appCommon/**/*.js'
        ],
        jsStagingFilesToDeployCustomer: [
            './valeta-lib.js',
            './deployment/release.js',
            './appCommon/base/restClient.base.js',
            './appCommon/base/**/*.js',
            './appCommon/app.js',
            './appCommon/mscorlib.js',
            './appCommon/**/*.js',
            './appCustomer/app.js',
            './appCustomer/**/*.js'
        ],
        jsStagingFilesToDeployStaff: [
            './valeta-lib.js',
            './deployment/release.js',
            './appCommon/base/restClient.base.js',
            './appCommon/base/**/*.js',
            './appCommon/app.js',
            './appCommon/mscorlib.js',
            './appCommon/**/*.js',
            './appStaff/app.js',
            './appStaff/**/*.js'
        ],
        jsStagingFilesToDeployALL: [
            './valeta-lib.js',
            './deployment/release.js',
            './appCommon/base/restClient.base.js',
            './appCommon/base/**/*.js',
            './appCommon/app.js',
            './appCommon/mscorlib.js',
            './appCommon/**/*.js',
            './appStaff/app.js',
            './appStaff/**/*.js',
            './appCustomer/app.js',
            './appCustomer/**/*.js'
        ],
        jsRCFilesToDeployALL: [
            './valeta-lib.js',
            './deployment/release.js',
            './appCommon/base/restClient.base.js',
            './appCommon/base/**/*.js',
            './appCommon/app.js',
            './appCommon/mscorlib.js',
            './appCommon/**/*.js',
            './appStaff/app.js',
            './appStaff/**/*.js',
            './appCustomer/app.js',
            './appCustomer/**/*.js'
        ],
        jsProductionFilesToDeployALL: [
            './valeta-lib.js',
            './deployment/release.js',
            './appCommon/base/restClient.base.js',
            './appCommon/base/**/*.js',
            './appCommon/app.js',
            './appCommon/mscorlib.js',
            './appCommon/**/*.js',
            './appStaff/app.js',
            './appStaff/**/*.js',
            './appCustomer/app.js',
            './appCustomer/**/*.js'
        ],
        jsProductionIncludes: [
            './valeta-lib.js',
            './valeta-app.js'
        ],
        cssIncludes: [
            './appCommon/css/site.css'
        ],
        bower: {
            json: require('./bower.json'),
            directory: './lib/',
            ignorePath: '../..'
        }
    }

    config.getWiredepDefaultOptions = function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    }

    config.getWiredepProductionOptions = function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath,
            exclude: "^.*\.(js|less)$"       //exclude all javascript files - those are concat'ed separate from wiredep
        };
        return options;
    }

    return config;
};