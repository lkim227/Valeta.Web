module AppCustomer {
    export class ConfigureRoutesForReservation {
        makeReservationState: ng.ui.IState;
        thankYouReservationState: ng.ui.IState;
        reservationState: ng.ui.IState;
        estimateState: ng.ui.IState;

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {
            this.makeReservationState = {
                name: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.makeReservationUiRoute,
                url: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.makeReservationUiUrl,
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppCustomerConfig.customerNavigationView,
                    "": {
                        templateUrl: "/appCustomer/Reservation/makeReservation.html"
                    }
                },
                data: {
                    PageTitle: "Make a Reservation",
                    SelectedSubnavigation: "Make a Reservation",
                    AreaUrl: "/appCustomer/Reservation/makeReservation.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                }
            };
            this.$stateProvider.state(this.makeReservationState);

            this.thankYouReservationState = {
                name: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.thankYouReservationUiRoute,
                url: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.thankYouReservationUiUrl,
                params: {
                    reservationID: null
                },
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppCustomerConfig.customerNavigationView,
                    "": {
                        templateUrl: "/appCommon/directives/customer/makeReservation/thankYouReservation.html"
                    }
                },
                data: {
                    PageTitle: "Thank You",
                    SelectedSubnavigation: "Make a Reservation",
                    AreaUrl: "/appCommon/directives/customer/makeReservation/thankYouReservation.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                }
            };
            this.$stateProvider.state(this.thankYouReservationState);

            this.estimateState = {
                name: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.estimateUiRoute,
                url: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.estimateUiUrl,
                params: {
                    reservationID: null
                },
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppCustomerConfig.customerNavigationView,
                    "": {
                        templateUrl: "/appCommon/directives/customer/estimateReservation/estimate.directive.html",
                    }
                },
                data: {
                    PageTitle: "Estimate",
                    SelectedSubnavigation: "Estimate",
                    AreaUrl: "/appCommon/directives/customer/estimateReservation/estimate.directive.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                }
            };
            this.$stateProvider.state(this.estimateState);

            this.reservationState = {
                name: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.reservationHistoryUiRoute,
                url: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.reservationHistoryUiUrl,
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppCustomerConfig.customerNavigationView,
                    "": {
                        templateUrl: "/appCustomer/Reservation/reservationHistory.html"
                    }
                },
                data: {
                    PageTitle: "Reservations",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                }
            };
            this.$stateProvider.state(this.reservationState);
        }
    }

    angular.module("app.customer")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForReservation($stateProvider, $urlRouterProvider)
        ]);

}