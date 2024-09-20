module AppStaff {
    export class ConfigureRoutesForDocumentBuilderContext {

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state("setup-messagetemplates",
            {
                url: "/setup-messagetemplates",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/DocumentBuilder/messageTemplate.html"
                    }
                },
                data: {
                    PageTitle: "Setup - Message Templates",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.systemSetup]
                }
            });
        }
    }

    angular.module("app.staff")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForDocumentBuilderContext($stateProvider, $urlRouterProvider)
        ]);

}