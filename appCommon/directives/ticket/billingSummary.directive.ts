module AppCommon {
    export interface IBillingSummaryAttributes extends ng.IAttributes {
    }

    export interface IBillingSummaryScope extends ng.IScope {
        ticketIdentifier: string;
        ticketStatus: TicketStatus;
        notifyBillingSummary: boolean;

        billingTotalSummary: BillingTotalSummaryDTO;

        viewBillingDocument(): void;
        emailBillingDocument(): void;
        refreshData(): void;
    }

    class BillingSummaryDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.billingSummaryTemplateUrl;
        scope = {
            ticketIdentifier: "=",
            ticketStatus: "=",
            notifyBillingSummary: "=?"
        };

        static $inject = ["$state", "$stateParams", "ReceiptQuery", "BillingDocumentForTicketQuery"];

        constructor(
            private $state: ng.ui.IStateService,
            private $stateParams: ng.ui.IStateParamsService,
            private receiptQuery: AppCommon.ReceiptQuery,
            private billingDocumentForTicketQuery: AppCommon.BillingDocumentForTicketQuery) {
        }

        link: ng.IDirectiveLinkFn = (scope: IBillingSummaryScope, elements: ng.IAugmentedJQuery, attrs: IBillingSummaryAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;

            scope.viewBillingDocument = (): void => {
                var url = this.$state.href("billing-document", { ticketIdentifier: scope.ticketIdentifier });
                window.open(url, "_self");
            }
            scope.emailBillingDocument = (): void => {
                if (scope.billingTotalSummary.ReceiptHTMLURL !== null && scope.billingTotalSummary.ReceiptHTMLURL.length > 0) {
                    self.receiptQuery.sendSavedReceipt(scope.ticketIdentifier)
                        .then(data => {
                            console.log("Receipt sent");
                        });
                } else {
                    self.billingDocumentForTicketQuery.sendSavedEstimate(scope.ticketIdentifier)
                        .then(data => {
                            console.log("Estimate sent");
                        });
                }
            }

            scope.refreshData = () => {
                self.billingDocumentForTicketQuery.getBillingTotalSummary(scope.ticketIdentifier, scope.ticketStatus)
                    .then(data => {
                        scope.billingTotalSummary = data;
                    });
            }

            scope.$watch("notifyBillingSummary",
                () => {
                    if (scope.notifyBillingSummary) {
                        scope.refreshData();
                        scope.notifyBillingSummary = false;
                    }
                },
                true);
            scope.$watch("ticketIdentifier",
                () => {
                    if (typeof (scope.ticketIdentifier) !== "undefined" && typeof (scope.ticketStatus) !== "undefined") {
                        if (scope.ticketIdentifier.length > 0) {
                            scope.refreshData();
                        }
                    }
                });
        }
    }

    angular.module("app.common")
        .directive("billingSummary",
        [
            "$state", "$stateParams", "ReceiptQuery", "BillingDocumentForTicketQuery",
            (s, sparams, rcpt, bill) => new BillingSummaryDirective(s, sparams, rcpt, bill)
        ]);
}