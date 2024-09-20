module AppCustomer {
    export class AppCustomerConfig {
        static accountProfileMyAccountView: ng.ui.IState;
        static accountProfileViews: any;
        static customerNavigationView: ng.ui.IState;
        static agentSessionSidebar: ng.ui.IState;
        static agentSesionViews: any;

        static agentViewUiRoute = "agent-view";
        static agentViewUiUrl = "/agent-view";
        static agentSessionUiRoutePrefix = "agent-session-";
        static agentSessionUiUrlPrefix = "/agent-session";
        static agentSessionCustomerAccountUiRouting: AppCommon.CustomerAccountUiRouting = {
            // UI routes
            appendCustomerIdentifier: true,
            accountProfileUiRoute: `${AppCustomerConfig.agentSessionUiRoutePrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountProfileUiRoute}`,
            profileEditUiRoute: `${AppCustomerConfig.agentSessionUiRoutePrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.profileEditUiRoute}`,
            accountVehiclesUiRoute: `${AppCustomerConfig.agentSessionUiRoutePrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountVehiclesUiRoute}`,
            accountPaymentMethodsUiRoute: `${AppCustomerConfig.agentSessionUiRoutePrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountPaymentMethodsUiRoute}`,
            pointsHistoryUiRoute: `${AppCustomerConfig.agentSessionUiRoutePrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.pointsHistoryUiRoute}`,
            rewardsCatalogUiRoute: `${AppCustomerConfig.agentSessionUiRoutePrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.rewardsCatalogUiRoute}`,
            makeReservationUiRoute: `${AppCustomerConfig.agentSessionUiRoutePrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.makeReservationUiRoute}`,
            thankYouReservationUiRoute: `${AppCustomerConfig.agentSessionUiRoutePrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.thankYouReservationUiRoute}`,
            reservationHistoryUiRoute: `${AppCustomerConfig.agentSessionUiRoutePrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.reservationHistoryUiRoute}`,
            estimateUiRoute: `${AppCustomerConfig.agentSessionUiRoutePrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.estimateUiRoute}`,
            ticketUiRoute: `${AppCustomerConfig.agentSessionUiRoutePrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.ticketUiRoute}`,
            billingDocumentUiRoute: `${AppCustomerConfig.agentSessionUiRoutePrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.billingDocumentUiRoute}`,
            billingRefundDocumentUiRoute: `${AppCustomerConfig.agentSessionUiRoutePrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.billingRefundDocumentUiRoute}`,
            billingOriginalDocumentUiRoute: `${AppCustomerConfig.agentSessionUiRoutePrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.billingOriginalDocumentUiRoute}`,
            agentViewUiRoute: "",

            // UI urls

            accountProfileUiUrl: `${AppCustomerConfig.agentSessionUiUrlPrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountProfileUiUrl}`,
            profileEditUiUrl: `${AppCustomerConfig.agentSessionUiUrlPrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.profileEditUiUrl}`,
            accountVehiclesUiUrl: `${AppCustomerConfig.agentSessionUiUrlPrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountVehiclesUiUrl}`,
            accountPaymentMethodsUiUrl: `${AppCustomerConfig.agentSessionUiUrlPrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountPaymentMethodsUiUrl}`,
            pointsHistoryUiUrl: `${AppCustomerConfig.agentSessionUiUrlPrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.pointsHistoryUiUrl}`,
            rewardsCatalogUiUrl: `${AppCustomerConfig.agentSessionUiUrlPrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.rewardsCatalogUiUrl}`,
            makeReservationUiUrl: `${AppCustomerConfig.agentSessionUiUrlPrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.makeReservationUiUrl}`,
            thankYouReservationUiUrl: `${AppCustomerConfig.agentSessionUiUrlPrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.thankYouReservationUiUrl}`,
            reservationHistoryUiUrl: `${AppCustomerConfig.agentSessionUiUrlPrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.reservationHistoryUiUrl}`,
            estimateUiUrl: `${AppCustomerConfig.agentSessionUiUrlPrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.estimateUiUrl}`,
            ticketUiUrl: `${AppCustomerConfig.agentSessionUiUrlPrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.ticketUiUrl}`,
            billingDocumentUiUrl: `${AppCustomerConfig.agentSessionUiUrlPrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.billingDocumentUiUrl}`,
            billingRefundDocumentUiUrl: `${AppCustomerConfig.agentSessionUiUrlPrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.billingRefundDocumentUiUrl}`,
            billingOriginalDocumentUiUrl: `${AppCustomerConfig.agentSessionUiUrlPrefix}${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.billingOriginalDocumentUiUrl}`,
            agentViewUiUrl: "",
        }

        constructor(
            private $stateProvider: ng.ui.IStateProvider,
            private $urlRouterProvider: ng.ui.IUrlRouterProvider,
            private $httpProvider: ng.IHttpProvider) {

            AppCommon.AppCommonConfig.setSystemRouteStates();
            AppCustomerConfig.setSystemRouteStates();
            AppCustomerConfig.setCustomerCommonViews();
            AppCustomerConfig.setAgentSessionsViews();
            this.initOtherRoutes();

            //cache buster - for HTML resources only
            var __version_number = Date.now();
            $httpProvider.interceptors.push(function () {
                return {
                    'request': function (config: any) {
                        //exceptions
                        var modalContentNamingConvention = "ModalContent";
                        if (config.url === "angular-busy.html"
                            || config.url === "window.html"
                            || config.url === "uib/template/modal/window.html"
                            || config.url.slice(-modalContentNamingConvention.length) === modalContentNamingConvention) return config;

                        // !!config.cached represents if the request is resolved using 
                        //      the angular-templatecache
                        if (!config.cached) {
                            config.url += ((config.url.indexOf('?') > -1) ? '&' : '?')
                                + config.paramSerializer({ v: __version_number });
                        } else if (config.url.indexOf('no-cache') > -1) {
                            // if the cached URL contains 'no-cache' then remove it from the cache
                            config.cache.remove(config.url);
                            config.cached = false; // unknown consequences
                            // Warning: if you remove the value form the cache, and the asset is not
                            //          accessable at the given URL, you will get a 404 error.
                        }
                        return config;
                    }
                }
            });
        }

        private static setCustomerCommonViews(): void {
            this.accountProfileMyAccountView = {
                templateUrl: "/appCustomer/Account/account.html",
                controller: "AccountController as vm"
            };
            this.accountProfileViews = {
                "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                "navigation": this.customerNavigationView,
                "": this.accountProfileMyAccountView
            };
        }

        private static setAgentSessionsViews(): void {
            this.agentSessionSidebar = {
                templateUrl: "/appCustomer/Agent/Session/agentSession.html",
                controller: "AgentSessionController as vm"
            };
            this.agentSesionViews = {
                "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                "navigation": this.customerNavigationView,
                "": this.agentSessionSidebar
            };
        }

        static setSystemRouteStates(): void {
            this.customerNavigationView = {
                templateUrl: "/appCustomer/navigation.html",
                controller: "NavigationController as navVm"
            };
        }

        private initOtherRoutes(): void {
            this.$urlRouterProvider.otherwise("customer-home");
        }
    }
}