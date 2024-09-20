module AppCommon {
    angular.module("app.common")
        .value("cgBusyDefaults",
        {
            message: "Almost there...",
            backdrop: true,
//        templateUrl: 'my_custom_template.html',
            delay: 300,
            minDuration: 700
//        wrapperClass: 'my-class my-class2'
        });
}