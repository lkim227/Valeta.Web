module AppStaff {
    export interface IOriginalSummaryAttributes extends ng.IAttributes {
    }

    export interface IOriginalSummaryScope extends ng.IScope {
        directiveInitialized: boolean;
        ticketNumber: string;
        ticketStatus: TicketStatus;
        originalTotalSummary: BillingTotalSummaryDTO;

        viewOriginalBillingDocument(): void;
        emailBillingDocument(): void;
        refreshData(): void;
    }

    class OriginalSummaryDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appStaff/Ticket/Billing/originalSummary.directive.html";
        scope = {
            ticketNumber: "="
        };

        static $inject = ["$state", "$stateParams", "ReceiptQuery", "BillingDocumentForTicketQuery"];

        constructor(
            private $state: ng.ui.IStateService,
            private $stateParams: ng.ui.IStateParamsService,
            private receiptQuery: AppCommon.ReceiptQuery,
            private billingDocumentForTicketQuery: AppCommon.BillingDocumentForTicketQuery) {
        }

        link: ng.IDirectiveLinkFn = (scope: IOriginalSummaryScope, elements: ng.IAugmentedJQuery, attrs: IOriginalSummaryAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            
            scope.viewOriginalBillingDocument = (): void => {
                var url = this.$state.href("billing-original-document", { documentIdentifier: scope.originalTotalSummary.ID });
                window.open(url, "_self");
            }

            scope.refreshData = () => {
                self.billingDocumentForTicketQuery.getOriginalBillingTotalSummary(scope.ticketNumber)
                    .then(data => {
                        scope.originalTotalSummary = data;
                    });
            }
            
            var initializeDirective = () => {
                scope.refreshData();

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
        }
    }

    angular.module("app.staff")
        .directive("originalSummary",
        [
            "$state", "$stateParams", "ReceiptQuery", "BillingDocumentForTicketQuery",
            (s, sparams, rcpt, bill) => new OriginalSummaryDirective(s, sparams, rcpt, bill)
        ]);
}