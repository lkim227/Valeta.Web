module AppCustomer {
    export class ConfigureRoutesForAgent {
        agentViewState: ng.ui.IState;

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.agentViewState = {
                name: AppCustomerConfig.agentViewUiRoute,
                url: AppCustomerConfig.agentViewUiUrl,
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppCustomerConfig.customerNavigationView,
                    "": {
                        templateUrl: "/appCustomer/Agent/agentView.html"
                    }
                },
                data: {
                    PageTitle: "Agent View",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                }
            };
            this.$stateProvider.state(this.agentViewState);
        }
    }

    angular.module("app.customer")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForAgent($stateProvider, $urlRouterProvider)
        ]);

}