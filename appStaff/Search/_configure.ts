module AppStaff {
    export class ConfigureRoutesForSearchContext {

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state("search-results",
                {
                    url: AppStaffConfig.searchResultsDisplayUrlSuffix + "?q=:terms",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: AppStaffConfig.searchResultsControllerTemplateUrl
                        }
                    },
                    data: {
                        PageTitle: "Search Results",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers]
                    }
                });
        }
    }

    angular.module("app.staff")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForSearchContext($stateProvider, $urlRouterProvider)
        ]);

}