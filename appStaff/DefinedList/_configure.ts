module AppStaff {
    export class ConfigureRoutesForDefinedListContext {

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state("setup-definedlist",
            {
                url: "/setup-definedlist",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/DefinedList/definedList.html"
                    }
                },
                data: {
                    PageTitle: "Setup - Defined List",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.systemSetup]
                }
            });
        }
    }

    angular.module("app.staff")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForDefinedListContext($stateProvider, $urlRouterProvider)
        ]);

}