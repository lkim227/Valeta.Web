module AppStaff {
    export class ConfigureForSecurityContext {

        static securityRightsRolesTemplateUrl = "Security/rightsRoles.directive.html";
        static securitySetUserRolesTemplateUrl = "Security/setUserRoles.directive.html";

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state("security-rightsroles",
                {
                    url: "/security-rightsroles",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/Security/rightsRoles.html"
                        }
                    },
                    data: {
                        PageTitle: "Security Roles & Rights",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.systemSetup]
                    }
                });

            this.$stateProvider.state("set-userroles",
                {
                    url: "/set-userroles/:userId/:userName",
                    params: {
                        userId: null,
                        userName: null
                    },
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/Security/setUserRoles.html"
                        }
                    },
                    data: {
                        PageTitle: "Set User Roles",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.systemSetup]
                    }
                });
        }
    }

    angular.module("app.staff")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureForSecurityContext ($stateProvider, $urlRouterProvider)
        ]);

}