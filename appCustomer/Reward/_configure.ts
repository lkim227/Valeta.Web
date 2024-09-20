module AppCustomer {
    export class ConfigureRoutesForRewards {
        pointsHistoryState: ng.ui.IState;
        rewardAvailableState: ng.ui.IState;
        rewardCatalogState: ng.ui.IState;

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.pointsHistoryState = {
                name: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.pointsHistoryUiRoute,
                url: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.pointsHistoryUiUrl,
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppCustomerConfig.customerNavigationView,
                    "": {
                        templateUrl: "/appCustomer/Reward/pointsHistory.html"
                    }
                },
                data: {
                    PageTitle: "History",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                }
            };
            this.rewardCatalogState = {
                name: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.rewardsCatalogUiRoute,
                url: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.rewardsCatalogUiUrl,
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppCustomerConfig.customerNavigationView,
                    "": {
                        templateUrl: "/appCustomer/Reward/rewardCatalog.html"
                    }
                },
                data: {
                    PageTitle: "Rewards Available",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                }
            };
            this.$stateProvider.state(this.pointsHistoryState);
            this.$stateProvider.state(this.rewardCatalogState);
        }
    }

    angular.module("app.customer")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForRewards($stateProvider, $urlRouterProvider)
        ]);

}