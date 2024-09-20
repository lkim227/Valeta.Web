module AppCommon {
    export interface ISplitPaymentAttrs extends ng.IAttributes {
    }

    export interface ISplitPaymentScope extends ng.IScope {
        directiveInitialized: boolean;

        billing: BillingQueryResult;
        reservation: ReservationDTO;
        paymentMethods: Array<PaymentMethodDTO>;
        availableServices: Array<OfferedServiceDTO>;
        initialMaxDailyRate: number;
        showErrorOninitialMaxDailyRate: boolean;
        isValid: boolean;
        showSplitPayment: boolean;

        applyNewDailyLimit(): void;
        cancelSplitPayment(): void;

        paymentMethodsCatchAll: PaymentMethodDTO[];
        paymentMethodsAllowance: PaymentMethodDTO[];
    }

    class SplitPaymentDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appCommon/directives/customer/makeReservation/2-payment/splitPayment.directive.html";
        scope = {
            billing: "=?",
            reservation: "=?",
            paymentMethods: "=?",
            availableServices: "=?",
            initialMaxDailyRate: "=?",
            isValid: "=?",
            showSplitPayment: "=?"
        };

        static $inject = ["SessionService", "KendoDataSourceService", "BillingQuery", "SplitPaymentQuery"];

        constructor(
            private sessionService: AppCommon.SessionService,
            private kendoDataSourceService: AppCommon.KendoDataSourceService,
            private billingQuery: AppCommon.BillingQuery,
            private splitPaymentQuery: AppCommon.SplitPaymentQuery) {
        }

        link: ng.IDirectiveLinkFn = (scope: ISplitPaymentScope, elements: ng.IAugmentedJQuery, attrs: ISplitPaymentAttrs) => {
            var self = this;

            scope.applyNewDailyLimit = () => {
                scope.showErrorOninitialMaxDailyRate = scope.billing.ReservationAllowanceOrder.ParkingDayRateAllowance > scope.initialMaxDailyRate;
                if (scope.showErrorOninitialMaxDailyRate) {
                    scope.billing.ReservationAllowanceOrder.ParkingDayRateAllowance = scope.initialMaxDailyRate;
                } else {
                    if (!!scope.billing.ReservationAllowanceOrder &&
                        !!scope.billing.ReservationAllowanceOrder.ReservedParkingDays)
                    this.splitPaymentQuery.tryDifferentAllowanceDailyRate(scope.billing, scope.reservation)
                        .then((data) => {
                            scope.billing = data;
                        });
                }
            }
            
            scope.cancelSplitPayment = () => {
                if (scope.billing.ReservationAllowanceOrder !== null) {
                    this.splitPaymentQuery.cancelSplitPayment(scope.billing, scope.reservation)
                        .then((data) => {
                            scope.billing = data;
                            scope.showSplitPayment = false;
                        });
                }
            }

            var initializeDirective = () => {
                //init values
                scope.paymentMethodsCatchAll = scope.paymentMethods.slice();
                scope.paymentMethodsAllowance = scope.paymentMethods.slice();

                scope.directiveInitialized = true;
            }
            var waitForScopeVariables = () => {
                var deregisterWaitBilling = scope.$watch("billing",
                    (newValue) => {
                        if (typeof (newValue) !== "undefined") {
                            deregisterWaitBilling();
                            initializeDirective();
                        }
                    });
                var deregisterWaitMaxDailyRate = scope.$watch("initialMaxDailyRate",
                    (newValue) => {
                        if (typeof (newValue) !== "undefined") {
                            deregisterWaitMaxDailyRate();
                            initializeDirective();
                        }
                    });
            }
            var waitForDom = () => {
                waitForScopeVariables();
            }
            setTimeout(waitForDom, 0);

            //var getPaymentMethodsExceptFor = (paymentMethodIDToExclude: string): PaymentMethodDTO[] => {
            //    var returnPaymentMethods = scope.paymentMethods.filter(item => item.ID !== paymentMethodIDToExclude);
            //    return returnPaymentMethods;
            //}

            var setFormIsValid = (): void => {
                var hasCatchAllOrderPaymentFilledIn = scope.billing.ReservationCatchAllOrder != null && !!scope.billing.ReservationCatchAllOrder.PaymentMethodID;
                var hasAllowanceOrderPaymentFilledIn = scope.billing.ReservationAllowanceOrder != null && !!scope.billing.ReservationAllowanceOrder.PaymentMethodID;
                var hasBothPaymentsFilledIn = hasCatchAllOrderPaymentFilledIn && hasAllowanceOrderPaymentFilledIn;
                var areBothPaymentDifferent = hasBothPaymentsFilledIn && scope.billing.ReservationCatchAllOrder.PaymentMethodID !== scope.billing.ReservationAllowanceOrder.PaymentMethodID;

                scope.isValid = hasBothPaymentsFilledIn && areBothPaymentDifferent;
            }

            scope.$watch("billing.ReservationCatchAllOrder.PaymentMethodID",
                (paymentMethodID: string) => {
                    setFormIsValid();
                });

            scope.$watch("billing.ReservationAllowanceOrder.PaymentMethodID",
                (paymentMethodID: string) => {
                    setFormIsValid();
                });

            initializeDirective();
            setFormIsValid();
        };


    }

    angular.module("app.common")
        .directive("splitPayment",
        [
            "SessionService", "KendoDataSourceService", "BillingQuery", "SplitPaymentQuery",
            (sessionService, kendoDs, payRepo, split) => new SplitPaymentDirective(sessionService, kendoDs, payRepo, split)
        ]);

}