module AppStaff {
    export class ConfigureForASFContext {

        static serviceTaskFulfillmentTemplateUrl = "ServiceTask/serviceTaskFulfillment.directive.html"; 
        static singleServiceTaskControllerTemplateUrl = "/appStaff/ServiceTask/singleServiceTask.html";
        static singleServiceTaskDisplayUrlSuffix = "/service-task";

        static communicationContext = "ServiceTask";

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state("service-fulfillment",
            {
                url: "/service-fulfillment",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/ServiceTask/ServiceTask.html"
                    }
                },
                data: {
                    PageTitle: "Service Department",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.serviceFulfillment]
                }
                });
            this.$stateProvider.state("service-fulfillment-thismonth",
                {
                    url: "/service-fulfillment-thismonth",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/ServiceTask/ServiceTaskThisMonth.html"
                        }
                    },
                    data: {
                        PageTitle: "Service Department This Month",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.serviceFulfillment]
                    }
                });
            this.$stateProvider.state("service-fulfillment-lastmonth",
                {
                    url: "/service-fulfillment-lastmonth",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/ServiceTask/ServiceTaskLastMonth.html"
                        }
                    },
                    data: {
                        PageTitle: "Service Department Last Month",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.serviceFulfillment]
                    }
                });

            this.$stateProvider.state("service-task",
                {
                    url: ConfigureForASFContext.singleServiceTaskDisplayUrlSuffix + "/:serviceTaskID",
                    params: {
                        serviceTaskID: null
                    },
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: ConfigureForASFContext.singleServiceTaskControllerTemplateUrl
                        }
                    },
                    data: {
                        PageTitle: "Additional Service Task",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.serviceFulfillment]
                    }
                });
        }
    }

    angular.module("app.staff")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureForASFContext($stateProvider, $urlRouterProvider)
        ]);

}