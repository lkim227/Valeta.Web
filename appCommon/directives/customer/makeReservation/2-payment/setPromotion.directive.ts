module AppCommon {
    export interface ISetPromotionAttrs extends ng.IAttributes {
    }

    export interface ISetPromotionScope extends ng.IScope {
        reservedPromotionDiscounts: ReservedPromotionDiscountDTO[];
        ticketNumber: string;
        ticketIdentifier: string;
        defaultPromoCode: string;

        promotionCodeInput: string;
        enteredPromotionCode: string;
        reservedPromotionCodes: string[];

        isCheckPromotionAttempted: boolean;
        checkPromotionResult: CheckPromotionCodeResultDTO;

        checkPromotion(promoCodeToCheck: string, isUserEntered: boolean): void;
    }

    class SetPromotionDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appCommon/directives/customer/makeReservation/2-payment/setPromotion.directive.html";
        scope = {
            reservedPromotionDiscounts: "=?",
            ticketNumber: "=?",
            ticketIdentifier: "=?",
            defaultPromoCode: "=?"
        };

        static $inject = ["SessionService", "BillingQuery"];

        constructor(private sessionService: AppCommon.SessionService,
            private billingQuery: AppCommon.BillingQuery) {
        }

        link: ng.IDirectiveLinkFn = (scope: ISetPromotionScope, elements: ng.IAugmentedJQuery, attrs: ISetPromotionAttrs) => {
            var self = this;
            var unbindWatch: () => void;

            scope.promotionCodeInput = "";
            scope.reservedPromotionCodes = [];
            scope.isCheckPromotionAttempted = false;

            var applyDefaultPromoCodeIfApplicable = () => {
                if (!GenericUtils.isUndefinedNullEmptyOrWhiteSpace(scope.defaultPromoCode)) {
                    scope.checkPromotion(scope.defaultPromoCode, false);
                }
            }

            var getReservedPromotionCodes = () => {
                if (scope.reservedPromotionDiscounts != null) {
                    unbindWatch();
                    if (scope.reservedPromotionDiscounts.length > 0 && scope.reservedPromotionCodes.length === 0) {
                        self.billingQuery.getReservedPromotionCodes(scope.ticketIdentifier)
                            .then((data) => {
                                if (!!data) {
                                    scope.reservedPromotionCodes = data;
                                }
                                applyDefaultPromoCodeIfApplicable();
                            });
                    } else {
                        applyDefaultPromoCodeIfApplicable();
                    }
                }
            };

            scope.checkPromotion = (promoCodeToCheck: string, isUserEntered: boolean) => {
                if (isUserEntered) {
                    scope.isCheckPromotionAttempted = false;
                }
                
                if (promoCodeToCheck.trim().length > 0) {                   
                    self.billingQuery.checkPromotionCode(promoCodeToCheck, scope.ticketNumber)
                        .then((data) => {
                            if (!!data) {
                                var result = data;

                                if (result.WillBeApplied) {
                                    if (!scope.reservedPromotionDiscounts) {
                                        scope.reservedPromotionDiscounts = [];
                                    }
                                    scope.reservedPromotionDiscounts = scope.reservedPromotionDiscounts.concat(result.RequestedPromotionDiscounts);
                                    scope.reservedPromotionCodes.push(promoCodeToCheck.toUpperCase());
                                }

                                if (isUserEntered) {
                                    scope.promotionCodeInput = "";
                                    scope.enteredPromotionCode = promoCodeToCheck;
                                    scope.checkPromotionResult = result;
                                    scope.isCheckPromotionAttempted = true;
                                }                      
                            }                           
                        });
                }
            };

            unbindWatch = scope.$watch(
                () => {
                    return ((scope.reservedPromotionDiscounts === null)
                        ? -1
                        : scope.reservedPromotionDiscounts.length);
                },
                () => {
                    getReservedPromotionCodes();
                },
                true);
        };
    }

    angular.module("app.common")
        .directive("setPromotion",
        [
            "SessionService", "BillingQuery",
            (sessionService, resRepo) => new SetPromotionDirective(sessionService, resRepo)
        ]);

}