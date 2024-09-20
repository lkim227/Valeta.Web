module AppCustomer {
    export class ConfigureRoutesForDashboard {
        dashboardState: ng.ui.IState;
        valetsInZoneState: ng.ui.IState;

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.dashboardState = {
                name: "customer-home",
                url: "/customer-home",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppCustomerConfig.customerNavigationView,
                    "": {
                        templateUrl: "/appCustomer/Dashboard/customerHome.html"
                    }
                },
                data: {
                    PageTitle: "Home",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                }
            };

            this.$stateProvider.state(this.dashboardState);
        }
    }

    angular.module("app.customer")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForDashboard($stateProvider, $urlRouterProvider)
        ]);

}