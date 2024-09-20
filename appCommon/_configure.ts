module AppCommon {
    export class CustomerAccountUiRouting {
        public appendCustomerIdentifier: boolean;

        // UI routes
        public accountProfileUiRoute: string;
        public profileEditUiRoute: string;
        public accountVehiclesUiRoute: string;
        public accountPaymentMethodsUiRoute: string;
        public pointsHistoryUiRoute: string;
        public rewardsCatalogUiRoute: string;
        public makeReservationUiRoute: string;
        public thankYouReservationUiRoute: string;
        public reservationHistoryUiRoute: string;
        public estimateUiRoute: string;
        public ticketUiRoute: string;
        public billingDocumentUiRoute: string;
        public billingRefundDocumentUiRoute: string;
        public billingOriginalDocumentUiRoute: string;
        public agentViewUiRoute: string;

        // UI urls
        public accountProfileUiUrl: string;
        public profileEditUiUrl: string;
        public accountVehiclesUiUrl : string;
        public accountPaymentMethodsUiUrl : string;
        public pointsHistoryUiUrl : string;
        public rewardsCatalogUiUrl : string;
        public makeReservationUiUrl : string;
        public thankYouReservationUiUrl : string;
        public reservationHistoryUiUrl : string;
        public estimateUiUrl : string;
        public ticketUiUrl : string;
        public billingDocumentUiUrl : string;
        public billingRefundDocumentUiUrl: string;
        public billingOriginalDocumentUiUrl: string;
        public agentViewUiUrl: string;
    }

    export class AppCommonConfig {
        static formPageHeaderState: ng.ui.IState;

        static recaptchaPublicKey = "6LcDtj8UAAAAAPcCADUO0lRq_YqhNCt8Zrtp4Eg6";
        static billingDocumentUrl = "/reports/";

        static electricMagicString = "Electric";
        static oversizedMagicString = "Oversized";
        static operatingLocationCustomerCode = "VALETA";

        static kendoGridBaseUrl = "/appCommon/base/kendoGrid.html";
        static kendoGridHierarchyBaseUrl = "/appCommon/base/kendoGridHierarchy.html";

        static airportMeetValidationTemplateUrl = "/appCommon/directives/airport/airportMeetValidation.directive.html";
        static extendedFlightDataTemplateUrl = "/appCommon/directives/airport/extendedFlightData.directive.html";
        static flightLookupTemplateUrl = "/appCommon/directives/airport/flightLookup.directive.html";

        static accountVehiclesTemplateUrl = "/appCommon/directives/customer/accountVehicles.directive.html";
        static accountVehicleImagesTemplateUrl = "/appCommon/directives/customer/accountVehicleImages.directive.html";
        static makeReservationWizardStep1Url = "/appCommon/directives/customer/makeReservation/makeReservation.wizardStep1.html";
        static makeReservationWizardStep2Url = "/appCommon/directives/customer/makeReservation/makeReservation.wizardStep2.html";
        static makeReservationWizardStep3Url = "/appCommon/directives/customer/makeReservation/makeReservation.wizardStep3.html";
        static makeReservationWizardStep4Url = "/appCommon/directives/customer/makeReservation/makeReservation.wizardStep4.html";
        static rewardAvailableTemplateUrl = "/appCommon/directives/customer/makeReservation/2-payment/rewardAvailable.directive.html";
        static splitPaymentReservedServicesListTemplateUrl = "/appCommon/directives/customer/makeReservation/2-payment/splitPayment.ReservedServices.directive.html";
        static splitPaymentReservedParkingDaysListTemplateUrl = "/appCommon/directives/customer/makeReservation/2-payment/splitPayment.ReservedParkingDays.directive.html";
        static reservationHistoryTemplateUrl = "/appCommon/directives/customer/reservationHistory.directive.html";
        static pointsEarnedHistoryTemplateUrl = "/appCommon/directives/customer/reward/pointsEarnedHistory.directive.html";
        static rewardCatalogTemplateUrl = "/appCommon/directives/customer/reward/rewardCatalog.directive.html";
        static pointSummaryTemplateUrl = "/appCommon/directives/customer/reward/pointSummary.directive.html";
        static valetsInZoneTemplateUrl = "/appCommon/directives/customer/valetsInZone.directive.html";

        static mobilePhoneUpdateTemplateUrl = "/appCommon/directives/ticket/mobilePhoneUpdate.directive.html";
        static emailAddressUpdateTemplateUrl = "/appCommon/directives/ticket/emailAddressUpdate.directive.html";
        static ccEmailsUpdateTemplateUrl = "/appCommon/directives/ticket/ccEmailsUpdate.directive.html";
        static keyTagUpdateTemplateUrl = "/appCommon/directives/ticket/keyTagUpdate.directive.html";
        static reservationNoteUpdateTemplateUrl = "/appCommon/directives/ticket/reservationNoteUpdate.directive.html";
        static vehicleInfoTemplateUrl = "/appCommon/directives/ticket/vehicleInfo.directive.html";
        static useTollTagInfoTemplateUrl = "/appCommon/directives/ticket/useTollTagInfo.directive.html";
        static returnIsCheckingBagsInfoTemplateUrl = "/appCommon/directives/ticket/returnIsCheckingBagsInfo.directive.html";
        static numberOfPeopleReturningInfoTemplateUrl = "/appCommon/directives/ticket/numberOfPeopleReturningInfo.directive.html";
        static billingSummaryTemplateUrl = "/appCommon/directives/ticket/billingSummary.directive.html";

        static dateFromToTemplateUrl = "/appCommon/directives/dateFromTo.directive.html";
        static definedListDropdownTemplateUrl = "/appCommon/directives/definedListDropdown.directive.html";
        static operatingLocationsTemplateUrl = "/appCommon/directives/operatingLocationDropdown.directive.html";


        static uiDateOnlyFormat = "M/d";
        static uiTimeOnlyFormat = "h:mm a";
        static uiDateTimeFormat = "M/d h:mm a";
        static isoDateTimeFormat = "yyyy-MM-ddTHH:mm:ssZ"; // ISO 8601 date/time with offset
        static isoDateOnlyFormat = "yyyy-MM-dd"; // ISO 8601 date-only   

        static timePickerOptionsParseFormat = "yyyy-MM-ddTHH:mm:sszzz";
        static timePickerOptionsFormat = "MM/dd h:mmtt";
        static timePickerOptionsInterval = 10;

        static valetMinutesInPlaceThreshold = 120;

        // UI routes
        static defaultCustomerAccountUiRouting: CustomerAccountUiRouting = {
            // UI routes
            appendCustomerIdentifier: false,
            accountProfileUiRoute: "account-profile",
            profileEditUiRoute: "profile-edit",
            accountVehiclesUiRoute: "account-vehicles",
            accountPaymentMethodsUiRoute: "account-paymentmethods",
            pointsHistoryUiRoute: "points-history",
            rewardsCatalogUiRoute: "rewards-catalog",
            makeReservationUiRoute: "make-reservation",
            thankYouReservationUiRoute: "thankyou-reservation",
            reservationHistoryUiRoute: "reservation-history",
            estimateUiRoute: "estimate",
            ticketUiRoute: "ticket",
            billingDocumentUiRoute: "billing-document",
            billingRefundDocumentUiRoute: "billing-refund-document",
            billingOriginalDocumentUiRoute: "billing-original-document",
            agentViewUiRoute: "agent-view",

            // UI urls
            accountProfileUiUrl: "/account-profile",
            profileEditUiUrl: "/account-profile",
            accountVehiclesUiUrl: "/account-vehicles",
            accountPaymentMethodsUiUrl: "/account-paymentmethods",
            pointsHistoryUiUrl: "/points-history",
            rewardsCatalogUiUrl: "/rewards-catalog",
            makeReservationUiUrl: "/make-reservation",
            thankYouReservationUiUrl: "/thankyou-reservation/:reservationID",
            reservationHistoryUiUrl: "/reservation-history",
            estimateUiUrl: "/estimate/:reservationID",
            ticketUiUrl: "/reservation/:ticketNumber",
            billingDocumentUiUrl: "/billing-document/:ticketIdentifier",
            billingRefundDocumentUiUrl: "/billing-refund-document/:ticketIdentifier/:transactionId",
            billingOriginalDocumentUiUrl: "/billing-original-document/:documentIdentifier",
            agentViewUiUrl: "/agent-view"
        }

        constructor(private $stateProvider: ng.ui.IStateProvider,
            private $urlRouterProvider: ng.ui.IUrlRouterProvider,
            private $linkedInProvider: any) {

            AppCommonConfig.setSystemRouteStates();
            this.initOtherRoutes();

            this.$linkedInProvider
                .set('appKey', '78bu5lsqz8fevq')
                .set('authorize', true)
                .set('lang', 'en_US')
                .set('scope', 'r_basicprofile r_emailaddress');
        }

        static setSystemRouteStates(): void {
            this.formPageHeaderState = {
                templateUrl: "/appCommon/formPageHeader.html",
                controller: "PageHeaderController as vm"
            };
        }

        private initOtherRoutes(): void {
            this.$urlRouterProvider.otherwise("login");

            this.$stateProvider.state("notauthorized",
                {
                    url: "/notauthorized",
                    templateUrl: "/appCommon/security/notAuthorized.html",
                    data: {
                        PageTitle: "Not Authorized"
                    }
                });
        }
    }
}