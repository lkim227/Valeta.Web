module AppStaff {
    export class ConfigureRoutesForRewardContext {

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state("setup-promotions",
            {
                url: "/setup-promotions",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/Reward/promotions.html"
                    }
                },
                data: {
                    PageTitle: "Setup - Promotion",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.systemSetup]
                }
            });

            this.$stateProvider.state("setup-rewards",
            {
                url: "/setup-rewards",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/Reward/reward.admin.html"
                    }
                },
                data: {
                    PageTitle: "Setup - Rewards",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.systemSetup]
                }
            });

            this.$stateProvider.state("reward-requests",
            {
                url: "/reward-requests",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/Reward/reward.requests.html"
                    }
                },
                data: {
                    PageTitle: "Reward Requests",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers]
                }
            });
        }
    }

    angular.module("app.staff")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForRewardContext($stateProvider, $urlRouterProvider)
        ]);

}