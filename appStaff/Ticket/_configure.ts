module AppStaff {
    export class ConfigureRoutesForTicketContext {

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state(AppStaffConfig.customerSessionCustomerAccountUiRouting.ticketUiRoute,
                {
                    url: AppStaffConfig.customerSessionCustomerAccountUiRouting.ticketUiUrl,
                    params: {
                        ticketNumber: null
                    },
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: AppStaffConfig.singleTicketControllerTemplateUrl
                        }
                    },
                    data: {
                        PageTitle: "Ticket",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers, AppCommon.AuthService.RIGHTS.dispatch]
                    }
                });

            this.$stateProvider.state(AppStaffConfig.customerSessionCustomerAccountUiRouting.billingDocumentUiRoute,
                {
                    url: AppStaffConfig.customerSessionCustomerAccountUiRouting.billingDocumentUiUrl,
                    params: {
                        ticketIdentifier: null
                    },
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appCommon/directives/ticket/billingDocument.html"
                        }
                    },
                    data: {
                        PageTitle: "Billing Document",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers, AppCommon.AuthService.RIGHTS.dispatch]
                    }
                });
            
            this.$stateProvider.state(AppStaffConfig.customerSessionCustomerAccountUiRouting.billingRefundDocumentUiRoute,
                {
                    url: AppStaffConfig.customerSessionCustomerAccountUiRouting.billingRefundDocumentUiUrl,
                    params: {
                        ticketIdentifier: null,
                        transactionId: null
                    },
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appCommon/directives/ticket/billingRefundDocument.html"
                        }
                    },
                    data: {
                        PageTitle: "Refund Document",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers, AppCommon.AuthService.RIGHTS.dispatch]
                    }
                });
            this.$stateProvider.state(AppStaffConfig.customerSessionCustomerAccountUiRouting.billingOriginalDocumentUiRoute,
                {
                    url: AppStaffConfig.customerSessionCustomerAccountUiRouting.billingOriginalDocumentUiUrl,
                    params: {
                        documentIdentifier: null
                    },
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appCommon/directives/ticket/billingOriginalDocument.html"
                        }
                    },
                    data: {
                        PageTitle: "Original Document",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.customers, AppCommon.AuthService.RIGHTS.dispatch]
                    }
                });
        }
    }

    angular.module("app.staff")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForTicketContext($stateProvider, $urlRouterProvider)
        ]);

}