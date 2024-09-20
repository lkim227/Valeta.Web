module AppStaff {
    export class ConfigureRoutesForAccountContext {

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state("customer-admin",
            {
                url: "/customer-admin",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/Customer/customer.admin.html"
                    }
                },
                data: {
                    PageTitle: "Customers",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers]
                }
            });

            this.$stateProvider.state("give-points",
            {
                url: "/give-points",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/Customer/givePoints/givePoints.html"
                    }
                },
                data: {
                    PageTitle: "Add / Remove Points",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers]
                }
            });

            this.$stateProvider.state("give-rewards",
            {
                url: "/give-rewards",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/Customer/giveReward/giveReward.html"
                    }
                },
                data: {
                    PageTitle: "Give Management Reward",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers]
                }
            });

            this.$stateProvider.state("create-new",
            {
                url: "/create-new",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appCommon/signup/createNew.html",
                        controller: "SignupController as vm"
                    }
                },
                data: {
                    PageTitle: "Create New Customer",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers]
                }
            });
        }
    }

    angular.module("app.staff")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForAccountContext($stateProvider, $urlRouterProvider)
        ]);

}