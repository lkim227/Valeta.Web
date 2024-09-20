module AppStaff {
    import AppCustomerConfig = AppCustomer.AppCustomerConfig;

    export class AppStaffConfig {
        static customerSessionSidebar: ng.ui.IState;
        static customerSessionViews: any;
        static staffNavigationView: ng.ui.IState;
        static formPageHeaderState: ng.ui.IState;

        static searchTemplateUrl = "Search/search.directive.html";
        static searchResultsControllerTemplateUrl = "/appStaff/Search/searchResults.html";
        static searchResultsDisplayUrlSuffix = "/search-results";

        static customerAdminTemplateUrl = "Customer/customer.admin.directive.html";
        static givePointsTemplateUrl = "Customer/givePoints/givePoints.directive.html";
        static giveRewardTemplateUrl = "Customer/giveReward/giveReward.directive.html";

        static valetPlacementTemplateUrl = "Dispatch/valetPlacement.directive.html";

        static viewEventsTemplateUrl = "Dispatch/viewEvents.directive.html";

        static employeeAdminTemplateUrl = "Employee/employee.admin.directive.html";
        static employeeTimesheetAdminTemplateUrl = "Timesheet/timesheet.directive.html";
        static debugEmployeeCommandsTemplateUrl = "Developer/debugEmployeeCommands.directive.html";

        static operatingLocationsTemplateUrl = "OperatingLocation/operatingLocations.directive.html";
        static zoneTemplateUrl = "OperatingLocation/zone/zone.directive.html";
        static zoneLotsTemplateUrl = "OperatingLocation/zone/zoneLots.directive.html";
        static lotTemplateUrl = "OperatingLocation/lot/lot.directive.html";
        static entranceTemplateUrl = "OperatingLocation/entrance/entrance.directive.html";
        static entranceMappingTemplateUrl = "OperatingLocation/entranceMeetLocationZoneMapping/entranceMeetLocationZoneMapping.directive.html";

        static messageTemplateTemplateUrl = "DocumentBuilder/messageTemplate.directive.html";

        static definedListTemplateUrl = "DefinedList/definedList.directive.html";

        static appStaffUrlPrefix = "/appStaff/#";

        static singleTicketControllerTemplateUrl = "/appStaff/Ticket/staffSingleTicket.html";

        static officeNoteUpdateTemplateUrl = "/appStaff/Ticket/officeNoteUpdate.directive.html";
        static keyLocationUpdateTemplateUrl = "/appStaff/Ticket/keyLocationUpdate.directive.html";
        static slotUpdateTemplateUrl = "/appStaff/Ticket/slotUpdate.directive.html";
        static meetDateTimeUpdateTemplateUrl = "/appStaff/Ticket/meetDateTimeUpdate.directive.html";
        static valetSagaUpdateTemplateUrl = "/appStaff/Ticket/valetSagaUpdate.directive.html";
        static zoneUpdateTemplateUrl = "/appStaff/Ticket/zoneUpdate.directive.html";

        static tipAddTemplateUrl = "/appStaff/Ticket/Billing/tip.directive.add.html";
        static tipListTemplateUrl = "/appStaff/Ticket/Billing/tip.directive.list.html";

        static lookAheadHours = 6;

        // UI routes

        static customerSessionUiUrlSuffix = "/:customerIdentifier";
        static customerSessionCustomerAccountUiRouting: AppCommon.CustomerAccountUiRouting = {
            // UI routes
            appendCustomerIdentifier: true,
            accountProfileUiRoute: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountProfileUiRoute}`,
            profileEditUiRoute: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.profileEditUiRoute}`,
            accountVehiclesUiRoute: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountVehiclesUiRoute}`,
            accountPaymentMethodsUiRoute: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountPaymentMethodsUiRoute}`,
            pointsHistoryUiRoute: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.pointsHistoryUiRoute}`,
            rewardsCatalogUiRoute: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.rewardsCatalogUiRoute}`,
            makeReservationUiRoute: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.makeReservationUiRoute}`,
            thankYouReservationUiRoute: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.thankYouReservationUiRoute}`,
            reservationHistoryUiRoute: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.reservationHistoryUiRoute}`,
            estimateUiRoute: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.estimateUiRoute}`,
            ticketUiRoute: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.ticketUiRoute}`,
            billingDocumentUiRoute: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.billingDocumentUiRoute}`,
            billingRefundDocumentUiRoute: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.billingRefundDocumentUiRoute}`,
            billingOriginalDocumentUiRoute: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.billingOriginalDocumentUiRoute}`,
            agentViewUiRoute: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.agentViewUiRoute}`,

            // UI urls
            accountProfileUiUrl: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountProfileUiUrl}${AppStaffConfig.customerSessionUiUrlSuffix}`,
            profileEditUiUrl: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.profileEditUiUrl}${AppStaffConfig.customerSessionUiUrlSuffix}`,
            accountVehiclesUiUrl: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountVehiclesUiUrl}${AppStaffConfig.customerSessionUiUrlSuffix}`,
            accountPaymentMethodsUiUrl: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountPaymentMethodsUiUrl}${AppStaffConfig.customerSessionUiUrlSuffix}`,
            pointsHistoryUiUrl: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.pointsHistoryUiUrl}${AppStaffConfig.customerSessionUiUrlSuffix}`,
            rewardsCatalogUiUrl: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.rewardsCatalogUiUrl}${AppStaffConfig.customerSessionUiUrlSuffix}`,
            makeReservationUiUrl: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.makeReservationUiUrl}${AppStaffConfig.customerSessionUiUrlSuffix}`,
            thankYouReservationUiUrl: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.thankYouReservationUiUrl}${AppStaffConfig.customerSessionUiUrlSuffix}`,
            reservationHistoryUiUrl: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.reservationHistoryUiUrl}${AppStaffConfig.customerSessionUiUrlSuffix}`,
            estimateUiUrl: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.estimateUiUrl}`,
            ticketUiUrl: `/ticket/:ticketNumber`,
            billingDocumentUiUrl: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.billingDocumentUiUrl}`,
            billingRefundDocumentUiUrl: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.billingRefundDocumentUiUrl}`,
            billingOriginalDocumentUiUrl: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.billingOriginalDocumentUiUrl}`,
            agentViewUiUrl: `${AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.agentViewUiUrl}`
        }

        // specific to staff
        static staffOnlyCustomerSessionCustomerAccountUiRouting = {
            appendCustomerIdentifier: true,

            // UI routes
            defaultUiRoute: `customer`,
            issuesUiRoute: `customer-issues`,
            communicationUiRoute: `customer-communication`,
            vehicleDamagesUiRoute: `vehicle-damages`,
            resetPasswordToUiRoute: `account-reset-passwordto`,

            // UI urls
            defaultUiUrl: `/customer${AppStaffConfig.customerSessionUiUrlSuffix}`,
            issuesUiUrl: `/customer-issues${AppStaffConfig.customerSessionUiUrlSuffix}`,
            communicationUiUrl: `/customer-communication${AppStaffConfig.customerSessionUiUrlSuffix}`,
            vehicleDamagesUiUrl: `/vehicle-damages${AppStaffConfig.customerSessionUiUrlSuffix}`,
            resetPasswordToUiUrl: `/account-reset-passwordto${AppStaffConfig.customerSessionUiUrlSuffix}`,
        }

        constructor(
            private $stateProvider: ng.ui.IStateProvider,
            private $urlRouterProvider: ng.ui.IUrlRouterProvider,
            private $httpProvider: ng.IHttpProvider) {

            AppCommon.AppCommonConfig.setSystemRouteStates();
            AppStaffConfig.setSystemRouteStates();
            AppStaffConfig.setCustomerAccountViews();
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

        private static setCustomerAccountViews(): void {
            this.customerSessionSidebar = {
                templateUrl: "/appStaff/Customer/Session/customerSession.html",
                controller: "CustomerSessionController as vm"
            };
            this.customerSessionViews = {
                "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                "navigation": this.staffNavigationView,
                "": this.customerSessionSidebar
            };
        }

        private static setSystemRouteStates(): void {
            this.staffNavigationView = {
                templateUrl: "/appStaff/navigation.html",
                controller: "NavigationController as navVm"
            };
        }

        private initOtherRoutes(): void {
            this.$urlRouterProvider.otherwise("employee-home");
        }
    };
}