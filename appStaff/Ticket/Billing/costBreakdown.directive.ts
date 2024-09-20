module AppStaff {
    export interface ICostBreakdownAttributes extends ng.IAttributes {
    }

    export interface ICostBreakdownScope extends ng.IScope {
        directiveInitialized: boolean;
        ticketIdentifier: string;
        ticketStatus: TicketStatus;
        isTicketClosed: boolean;
        isCatchAllOrder: boolean;
        
        order: OrderDTO;

        viewBillingDocument(): void;
        emailBillingDocument(): void;
        refreshData(): void;
    }

    class CostBreakdownDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appStaff/Ticket/Billing/costBreakdown.directive.html";
        scope = {
            ticketIdentifier: "=",
            ticketStatus: "=",
            isTicketClosed: "=",
            isCatchAllOrder: "="
        };

        static $inject = ["$state", "$stateParams", "ReceiptQuery", "BillingDocumentForTicketQuery"];

        constructor(
            private $state: ng.ui.IStateService,
            private $stateParams: ng.ui.IStateParamsService,
            private receiptQuery: AppCommon.ReceiptQuery,
            private billingDocumentForTicketQuery: AppCommon.BillingDocumentForTicketQuery) {
        }

        link: ng.IDirectiveLinkFn = (scope: ICostBreakdownScope, elements: ng.IAugmentedJQuery, attrs: ICostBreakdownAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            
            scope.viewBillingDocument = (): void => {
                var url = this.$state.href("billing-document", { ticketIdentifier: scope.ticketIdentifier});
                window.open(url, "_self");
            }
            scope.emailBillingDocument = (): void => {
                //if (scope.originalTotalSummary.ReceiptHTMLURL !== null && scope.ticketStatus === TicketStatus.Closed) {
                //    self.receiptQuery.sendSavedReceipt(scope.ticketIdentifier)
                //        .then(data => {
                //            console.log("Receipt sent");
                //        });
                //} else {
                //    self.billingDocumentForTicketQuery.sendSavedEstimate(scope.ticketIdentifier)
                //        .then(data => {
                //            console.log("Estimate sent");
                //        });
                //}
            }

            scope.refreshData = () => {
                if (scope.isTicketClosed) {
                    self.billingDocumentForTicketQuery.getBillingCostBreakdown(scope.ticketIdentifier, scope.isCatchAllOrder)
                        .then(data => {
                            scope.order = data;
                        });
                }
            }
            
            var initializeDirective = () => {
                scope.refreshData();

                scope.directiveInitialized = true;
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("isTicketClosed",
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
        }
    }

    angular.module("app.staff")
        .directive("costBreakdown",
        [
            "$state", "$stateParams", "ReceiptQuery", "BillingDocumentForTicketQuery",
            (s, sparams, rcpt, bill) => new CostBreakdownDirective(s, sparams, rcpt, bill)
        ]);
}