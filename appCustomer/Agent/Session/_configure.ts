module AppCustomer {
    import AppCommonConfig = AppCommon.AppCommonConfig;

    export class ConfigureRoutesForAgentSession {
        accountProfileState: ng.ui.IState;
        accountProfileEditState: ng.ui.IState;
        accountVehicleState: ng.ui.IState;
        accountPaymentMethodState: ng.ui.IState;
        pointsHistoryState: ng.ui.IState;
        rewardCatalogState: ng.ui.IState;
        makeReservationState: ng.ui.IState;
        thankYouReservationState: ng.ui.IState;
        reservationHistoryState: ng.ui.IState;
        estimateState: ng.ui.IState;
        pageTitle: string;

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(
            private $stateProvider: ng.ui.IStateProvider,
            private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.pageTitle = "Agent Session";

            this.accountProfileState = {
                name: AppCustomerConfig.agentSessionCustomerAccountUiRouting.accountProfileUiRoute,
                url: AppCustomerConfig.agentSessionCustomerAccountUiRouting.accountProfileUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppCustomerConfig.agentSesionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Profile",
                    AreaUrl: "/appCommon/directives/customer/profile/profile.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer],
                    CustomerAccountUiRouting: AppCustomerConfig.agentSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.accountProfileState);

            this.accountProfileEditState = {
                name: AppCustomerConfig.agentSessionCustomerAccountUiRouting.profileEditUiRoute,
                url: AppCustomerConfig.agentSessionCustomerAccountUiRouting.accountProfileUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppCustomerConfig.agentSesionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Profile",
                    AreaUrl: "/appCommon/directives/customer/profile/profile.edit.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer],
                    CustomerAccountUiRouting: AppCustomerConfig.agentSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.accountProfileEditState);

            this.accountVehicleState = {
                name: AppCustomerConfig.agentSessionCustomerAccountUiRouting.accountVehiclesUiRoute,
                url: AppCustomerConfig.agentSessionCustomerAccountUiRouting.accountVehiclesUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppCustomerConfig.agentSesionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Vehicles",
                    AreaUrl: "/appCustomer/Account/vehicles.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer],
                    CustomerAccountUiRouting: AppCustomerConfig.agentSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.accountVehicleState);

            this.accountPaymentMethodState = {
                name: AppCustomerConfig.agentSessionCustomerAccountUiRouting.accountPaymentMethodsUiRoute,
                url: AppCustomerConfig.agentSessionCustomerAccountUiRouting.accountPaymentMethodsUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppCustomerConfig.agentSesionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Credit Cards",
                    AreaUrl: "/appCustomer/Account/accountPaymentMethods.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer],
                    CustomerAccountUiRouting: AppCustomerConfig.agentSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.accountPaymentMethodState);

            this.pointsHistoryState = {
                name: AppCustomerConfig.agentSessionCustomerAccountUiRouting.pointsHistoryUiRoute,
                url: AppCustomerConfig.agentSessionCustomerAccountUiRouting.pointsHistoryUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppCustomerConfig.agentSesionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Reward History",
                    AreaUrl: "/appCustomer/Reward/pointsHistory.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer],
                    CustomerAccountUiRouting: AppCustomerConfig.agentSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.pointsHistoryState);

            this.rewardCatalogState = {
                name: AppCustomerConfig.agentSessionCustomerAccountUiRouting.rewardsCatalogUiRoute,
                url: AppCustomerConfig.agentSessionCustomerAccountUiRouting.rewardsCatalogUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppCustomerConfig.agentSesionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Rewards Available",
                    AreaUrl: "/appCommon/directives/customer/reward/rewardCatalog.directive.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer],
                    CustomerAccountUiRouting: AppCustomerConfig.agentSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.rewardCatalogState);

            this.makeReservationState = {
                name: AppCustomerConfig.agentSessionCustomerAccountUiRouting.makeReservationUiRoute,
                url: AppCustomerConfig.agentSessionCustomerAccountUiRouting.makeReservationUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppCustomerConfig.agentSesionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Make a Reservation",
                    AreaUrl: "/appCustomer/Reservation/makeReservation.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer],
                    CustomerAccountUiRouting: AppCustomerConfig.agentSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.makeReservationState);

            this.thankYouReservationState = {
                name: AppCustomerConfig.agentSessionCustomerAccountUiRouting.thankYouReservationUiRoute,
                url: AppCustomerConfig.agentSessionCustomerAccountUiRouting.thankYouReservationUiUrl,
                params: {
                    reservationID: null,
                    customerIdentifier: null
                },
                views: AppCustomerConfig.agentSesionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Thank You",
                    AreaUrl: "/appCommon/directives/customer/makeReservation/thankYouReservation.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer],
                    CustomerAccountUiRouting: AppCustomerConfig.agentSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.thankYouReservationState);

            this.reservationHistoryState = {
                name: AppCustomerConfig.agentSessionCustomerAccountUiRouting.reservationHistoryUiRoute,
                url: AppCustomerConfig.agentSessionCustomerAccountUiRouting.reservationHistoryUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppCustomerConfig.agentSesionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Reservations",
                    AreaUrl: "/appCustomer/Reservation/reservationHistory.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer],
                    CustomerAccountUiRouting: AppCustomerConfig.agentSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.reservationHistoryState);

            this.estimateState = {
                name: AppCustomerConfig.agentSessionCustomerAccountUiRouting.estimateUiRoute,
                url: AppCustomerConfig.agentSessionCustomerAccountUiRouting.estimateUiUrl,
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
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer],
                    CustomerAccountUiRouting: AppCustomerConfig.agentSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.estimateState);

            this.$stateProvider.state(AppCustomerConfig.agentSessionCustomerAccountUiRouting.ticketUiRoute,
                {
                    url: AppCustomerConfig.agentSessionCustomerAccountUiRouting.ticketUiUrl,
                    params: {
                        ticketNumber: null
                    },
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppCustomerConfig.customerNavigationView,
                        "": {
                            templateUrl: "/appCustomer/Ticket/customerSingleTicket.html"
                        }
                    },
                    data: {
                        PageTitle: "Reservation",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer],
                        CustomerAccountUiRouting: AppCustomerConfig.agentSessionCustomerAccountUiRouting
                    }
                });


            this.$stateProvider.state(AppCustomerConfig.agentSessionCustomerAccountUiRouting.billingDocumentUiRoute, 
                {
                    url: AppCustomerConfig.agentSessionCustomerAccountUiRouting.billingDocumentUiUrl,
                    params: {
                        ticketIdentifier: null
                    },
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppCustomerConfig.customerNavigationView,
                        "": {
                            templateUrl: "/appCommon/directives/ticket/billingDocument.html"
                        }
                    },
                    data: {
                        PageTitle: "Billing Document",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer],
                        CustomerAccountUiRouting: AppCustomerConfig.agentSessionCustomerAccountUiRouting
                    }
                });

            this.$stateProvider.state(AppCustomerConfig.agentSessionCustomerAccountUiRouting.billingRefundDocumentUiRoute,
                {
                    url: AppCustomerConfig.agentSessionCustomerAccountUiRouting.billingRefundDocumentUiUrl,
                    params: {
                        ticketIdentifier: null,
                        transactionId: null
                    },
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppCustomerConfig.customerNavigationView,
                        "": {
                            templateUrl: "/appCommon/directives/ticket/billingRefundDocument.html"
                        }
                    },
                    data: {
                        PageTitle: "Refund Document",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer],
                        CustomerAccountUiRouting: AppCustomerConfig.agentSessionCustomerAccountUiRouting
                    }
                });
            this.$stateProvider.state(AppCustomerConfig.agentSessionCustomerAccountUiRouting.billingOriginalDocumentUiRoute,
                {
                    url: AppCustomerConfig.agentSessionCustomerAccountUiRouting.billingOriginalDocumentUiUrl,
                    params: {
                        documentIdentifier: null
                    },
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppCustomerConfig.customerNavigationView,
                        "": {
                            templateUrl: "/appCommon/directives/ticket/billingOriginalDocument.html"
                        }
                    },
                    data: {
                        PageTitle: "Original Document",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer],
                        CustomerAccountUiRouting: AppCustomerConfig.agentSessionCustomerAccountUiRouting
                    }
                });
        }
    }

    angular.module("app.customer")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForAgentSession($stateProvider, $urlRouterProvider)
        ]);

}