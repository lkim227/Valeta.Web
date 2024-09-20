module AppCustomer {
    import AppCommonConfig = AppCommon.AppCommonConfig;

    export class ConfigureRoutesForTicketContext {

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state(AppCommonConfig.defaultCustomerAccountUiRouting.ticketUiRoute,
                {
                    url: AppCommonConfig.defaultCustomerAccountUiRouting.ticketUiUrl,
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
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                    }
                });


            this.$stateProvider.state(AppCommonConfig.defaultCustomerAccountUiRouting.billingDocumentUiRoute,
                {
                    url: AppCommonConfig.defaultCustomerAccountUiRouting.billingDocumentUiUrl,
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
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                    }
                });

            this.$stateProvider.state(AppCommonConfig.defaultCustomerAccountUiRouting.billingRefundDocumentUiRoute,
                {
                    url: AppCommonConfig.defaultCustomerAccountUiRouting.billingRefundDocumentUiUrl,
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
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                    }
                });
            this.$stateProvider.state(AppCommonConfig.defaultCustomerAccountUiRouting.billingOriginalDocumentUiRoute,
                {
                    url: AppCommonConfig.defaultCustomerAccountUiRouting.billingOriginalDocumentUiUrl,
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
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                    }
                });
        }
    }

    angular.module("app.customer")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForTicketContext($stateProvider, $urlRouterProvider)
        ]);

}