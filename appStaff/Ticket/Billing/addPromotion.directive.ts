module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface IAddPromotionAttrs extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IAddPromotionScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        ticketNumber: string;
        ticketStatus: TicketStatus;

        promotionCodeInput: string;

        isCheckPromotionAttempted: boolean;
        checkPromotionResult: CheckPromotionCodeResultDTO;

        utils: AppCommon.GenericUtils; // for html calls

        isInEditMode: boolean;

        addPromotionDiscount(): void;
        onCancel(): void;
    }

    class AddPromotionDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appStaff/Ticket/Billing/addPromotion.directive.html";
        scope = {
            isInEditMode: "=",
            ticketIdentifier: "=?",
            ticketNumber: "=?",
            ticketStatus: "="
        };

        static $inject = ["SessionService", "BillingQuery", "ValetServiceCommand"];

        constructor(private sessionService: AppCommon.SessionService,
            private billingQuery: AppCommon.BillingQuery,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: IAddPromotionScope, elements: ng.IAugmentedJQuery, attrs: IAddPromotionAttrs) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;
            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && !AppCommon.TicketUtils.isTicketClosed(scope.ticketStatus);

            scope.isInEditMode = false;
            var createdBy = this.sessionService.userInfo.employeeFriendlyID;

            scope.promotionCodeInput = "";
            scope.isCheckPromotionAttempted = false;
            
            scope.addPromotionDiscount = (): void => {
                if (scope.promotionCodeInput.trim().length > 0) {
                    self.billingQuery.checkPromotionCode(scope.promotionCodeInput, scope.ticketNumber)
                        .then((data) => {
                            if (!!data) {
                                var result = data;

                                if (result.WillBeApplied && data.RequestedPromotionDiscounts.length > 0) {
                                    scope.promotionCodeInput = scope.promotionCodeInput.toUpperCase();

                                    var command = new AddPromotionDiscountCommandDTO();

                                    command.ID = scope.ticketIdentifier;
                                    command.CreatedBy = createdBy;
                                    command.PromotionDiscounts = data.RequestedPromotionDiscounts;
                                    self.valetServiceCommand.doCommand(CommonConfiguration_Routing.BillingCommandRoute, command)
                                        .then((data) => {
                                            //scope.reload = true;
                                        });
                                }
                            }
                        });
                }
                scope.isInEditMode = false;
            }
            scope.onCancel = (): void => {
                scope.isInEditMode = false;
            }
            var initializeDirective = () => {
                scope.directiveInitialized = true;
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("ticketNumber",
                    (newValue) => {
                        if (typeof (newValue) !== "undefined") {
                            deregisterWait();
                            initializeDirective();
                        }
                    });;
            }
            var waitForDom = () => {
                waitForScopeVariables();
            }
            setTimeout(waitForDom, 0);
        };
    }

    angular.module("app.staff")
        .directive("addPromotion",
        [
            "SessionService", "BillingQuery", "ValetServiceCommand",
            (sessionService, b, v) => new AddPromotionDirective(sessionService, b, v)
        ]);

}