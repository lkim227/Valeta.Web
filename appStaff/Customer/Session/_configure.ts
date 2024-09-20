module AppStaff {
    import AppCommonConfig = AppCommon.AppCommonConfig;

    export class ConfigureRoutesForCustomerSession {
        customerState: ng.ui.IState;
        accountProfileState: ng.ui.IState;
        accountProfileEditState: ng.ui.IState;
        accountProfileUnavailableState: ng.ui.IState;
        accountVehicleState: ng.ui.IState;
        accountPaymentMethodState: ng.ui.IState;
        accountRewardHistoryState: ng.ui.IState;
        accountRewardsCatalogState: ng.ui.IState;
        makeReservationState: ng.ui.IState;
        thankYouReservationState: ng.ui.IState;
        reservationHistoryState: ng.ui.IState;
        agentViewState: ng.ui.IState;
        issuesState: ng.ui.IState;
        damagesState: ng.ui.IState;
        communicationState: ng.ui.IState;
        resetPasswordToState: ng.ui.IState;
        pageTitle: string;

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(
            private $stateProvider: ng.ui.IStateProvider,
            private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.pageTitle = "Customer";

            this.customerState = {
                name: AppStaffConfig.staffOnlyCustomerSessionCustomerAccountUiRouting.defaultUiRoute,
                url: AppStaffConfig.staffOnlyCustomerSessionCustomerAccountUiRouting.defaultUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppStaffConfig.customerSessionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Profile",
                    AreaUrl: "/appCommon/directives/customer/profile/profile.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers],
                    CustomerAccountUiRouting: AppStaffConfig.customerSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.customerState);

            this.accountProfileState = {
                name: AppStaffConfig.customerSessionCustomerAccountUiRouting.accountProfileUiRoute,
                url: AppStaffConfig.customerSessionCustomerAccountUiRouting.accountProfileUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppStaffConfig.customerSessionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Profile",
                    AreaUrl: "/appCommon/directives/customer/profile/profile.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers],
                    CustomerAccountUiRouting: AppStaffConfig.customerSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.accountProfileState);

            this.accountProfileEditState = {
                name: AppStaffConfig.customerSessionCustomerAccountUiRouting.profileEditUiRoute,
                url: AppStaffConfig.customerSessionCustomerAccountUiRouting.accountProfileUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppStaffConfig.customerSessionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Profile",
                    AreaUrl: "/appCommon/directives/customer/profile/profile.edit.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers],
                    CustomerAccountUiRouting: AppStaffConfig.customerSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.accountProfileEditState);

            this.accountProfileUnavailableState = {
                name: "account-profile-unavailable",
                url: "/account-profile-unavailable",
                templateUrl: "/appCommon/directives/customer/profile/profile.unavailable.html",
                data: {
                    PageTitle: "Customer Profile Unavailable",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers]
                }
            };
            this.$stateProvider.state(this.accountProfileUnavailableState);

            this.accountVehicleState = {
                name: AppStaffConfig.customerSessionCustomerAccountUiRouting.accountVehiclesUiRoute,
                url: AppStaffConfig.customerSessionCustomerAccountUiRouting.accountVehiclesUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppStaffConfig.customerSessionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Vehicles",
                    AreaUrl: "/appStaff/Customer/Session/vehicles.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers],
                    CustomerAccountUiRouting: AppStaffConfig.customerSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.accountVehicleState);

            this.accountPaymentMethodState = {
                name: AppStaffConfig.customerSessionCustomerAccountUiRouting.accountPaymentMethodsUiRoute,
                url: AppStaffConfig.customerSessionCustomerAccountUiRouting.accountPaymentMethodsUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppStaffConfig.customerSessionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Credit Cards",
                    AreaUrl: "/appStaff/Customer/Session/accountPaymentMethods.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers],
                    CustomerAccountUiRouting: AppStaffConfig.customerSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.accountPaymentMethodState);

            this.accountRewardHistoryState = {
                name: AppStaffConfig.customerSessionCustomerAccountUiRouting.pointsHistoryUiRoute,
                url: AppStaffConfig.customerSessionCustomerAccountUiRouting.pointsHistoryUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppStaffConfig.customerSessionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Reward History",
                    AreaUrl: "/appStaff/Customer/Session/pointsHistory.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers],
                    CustomerAccountUiRouting: AppStaffConfig.customerSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.accountRewardHistoryState);

            this.accountRewardsCatalogState = {
                name: AppStaffConfig.customerSessionCustomerAccountUiRouting.rewardsCatalogUiRoute,
                url: AppStaffConfig.customerSessionCustomerAccountUiRouting.rewardsCatalogUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppStaffConfig.customerSessionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Rewards Available",
                    AreaUrl: "/appStaff/Customer/Session/rewardCatalog.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers],
                    CustomerAccountUiRouting: AppStaffConfig.customerSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.accountRewardsCatalogState);

            this.makeReservationState = {
                name: AppStaffConfig.customerSessionCustomerAccountUiRouting.makeReservationUiRoute,
                url: AppStaffConfig.customerSessionCustomerAccountUiRouting.makeReservationUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppStaffConfig.customerSessionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Make a Reservation",
                    AreaUrl: "/appStaff/Customer/Session/makeReservation.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers],
                    CustomerAccountUiRouting: AppStaffConfig.customerSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.makeReservationState);

            this.thankYouReservationState = {
                name: AppStaffConfig.customerSessionCustomerAccountUiRouting.thankYouReservationUiRoute,
                url: AppStaffConfig.customerSessionCustomerAccountUiRouting.thankYouReservationUiUrl,
                params: {
                    reservationID: null,
                    customerIdentifier: null
                },
                views: AppStaffConfig.customerSessionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Thank You",
                    AreaUrl: "/appCommon/directives/customer/makeReservation/thankYouReservation.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers],
                    CustomerAccountUiRouting: AppStaffConfig.customerSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.thankYouReservationState);

            this.reservationHistoryState = {
                name: AppStaffConfig.customerSessionCustomerAccountUiRouting.reservationHistoryUiRoute,
                url: AppStaffConfig.customerSessionCustomerAccountUiRouting.reservationHistoryUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppStaffConfig.customerSessionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Reservations",
                    AreaUrl: "/appStaff/Customer/Session/reservationHistory.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers],
                    CustomerAccountUiRouting: AppStaffConfig.customerSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.reservationHistoryState);
            
            this.agentViewState = {
                name: AppStaffConfig.customerSessionCustomerAccountUiRouting.agentViewUiRoute,
                url: AppStaffConfig.customerSessionCustomerAccountUiRouting.agentViewUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppStaffConfig.customerSessionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Agent View",
                    AreaUrl: "/appStaff/Customer/Session/agentView.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers],
                    CustomerAccountUiRouting: AppStaffConfig.customerSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.agentViewState);


            this.issuesState = {
                name: AppStaffConfig.staffOnlyCustomerSessionCustomerAccountUiRouting.issuesUiRoute,
                url: AppStaffConfig.staffOnlyCustomerSessionCustomerAccountUiRouting.issuesUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppStaffConfig.customerSessionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Issues",
                    AreaUrl: "/appStaff/Customer/Session/issues.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers],
                    CustomerAccountUiRouting: AppStaffConfig.customerSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.issuesState);

            this.communicationState = {
                name: AppStaffConfig.staffOnlyCustomerSessionCustomerAccountUiRouting.communicationUiRoute,
                url: AppStaffConfig.staffOnlyCustomerSessionCustomerAccountUiRouting.communicationUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppStaffConfig.customerSessionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Communication",
                    AreaUrl: "/appStaff/Customer/Session/communication.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers],
                    CustomerAccountUiRouting: AppStaffConfig.customerSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.communicationState);

            this.damagesState = {
                name: AppStaffConfig.staffOnlyCustomerSessionCustomerAccountUiRouting.vehicleDamagesUiRoute,
                url: AppStaffConfig.staffOnlyCustomerSessionCustomerAccountUiRouting.vehicleDamagesUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppStaffConfig.customerSessionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Damages",
                    AreaUrl: "/appStaff/Customer/Session/damages.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers],
                    CustomerAccountUiRouting: AppStaffConfig.customerSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.damagesState);

            this.resetPasswordToState = {
                name: AppStaffConfig.staffOnlyCustomerSessionCustomerAccountUiRouting.resetPasswordToUiRoute,
                url: AppStaffConfig.staffOnlyCustomerSessionCustomerAccountUiRouting.resetPasswordToUiUrl,
                params: {
                    customerIdentifier: null
                },
                views: AppStaffConfig.customerSessionViews,
                data: {
                    PageTitle: this.pageTitle,
                    SelectedSubnavigation: "Reset Customer Password",
                    AreaUrl: "/appStaff/Customer/Session/resetPasswordTo.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    CustomerAccountUiRouting: AppStaffConfig.customerSessionCustomerAccountUiRouting
                }
            };
            this.$stateProvider.state(this.resetPasswordToState);
        }
    }

    angular.module("app.staff")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForCustomerSession($stateProvider, $urlRouterProvider)
        ]);

}