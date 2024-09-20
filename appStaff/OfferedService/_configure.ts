module AppStaff {
    export class ConfigureRoutesForSystemContext {

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {
            
            this.$stateProvider.state("setup-additionalservice",
                {
                    url: "/setup-additionalservice",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/OfferedService/offeredService.html"
                        }
                    },
                    data: {
                        PageTitle: "Setup - Additional services",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.systemSetup]
                    }
                });
        }
    }

    angular.module("app.staff")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForSystemContext($stateProvider, $urlRouterProvider)
        ]);

}