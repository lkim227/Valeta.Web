module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface IRefundListAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IRefundListScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        ticketNumber: number;
        ticketStatus: TicketStatus;
        catchAllCard: string;
        catchAllRefunds: RefundDTO[];
        allowanceCard: string;
        allowanceRefunds: RefundDTO[];
        billing: BillingQueryResult;
        createdBy: string;
        
        utils: AppCommon.GenericUtils; // for html calls
        
        goToRefundReceiptURL(item: RefundDTO): void;
    }

    class RefundListDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appStaff/Ticket/Billing/refund.directive.list.html";
        scope = {
            ticketIdentifier: "=",
            ticketNumber: "=",
            ticketStatus: "=",
            catchAllCard: "=",
            allowanceCard: "=",
            billing: "="
        };

        static $inject = ["$state", "SessionService", "AuthService", "RefundService", "BillingQuery"];

        constructor(
            private $state: ng.ui.IStateService, 
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private refundService: AppStaff.RefundService,
            private billingQuery: AppCommon.BillingQuery) {
        }

        link: ng.IDirectiveLinkFn = (scope: IRefundListScope, elements: ng.IAugmentedJQuery, attrs: IRefundListAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;
           
            var initializeDirective = () => {
                scope.directiveInitialized = true;
                
                if (!!scope.billing.ReservationCatchAllOrder.Refunds) {
                    scope.catchAllRefunds = scope.billing.ReservationCatchAllOrder.Refunds;
                }

                if (!!scope.billing.ReservationAllowanceOrder && !!scope.billing.ReservationAllowanceOrder.Refunds) {
                    scope.allowanceRefunds = scope.billing.ReservationAllowanceOrder.Refunds;
                }

                //this.billingQuery.getById(scope.ticketIdentifier)
                //    .then((results) => {
                //        scope.tipRecipients = results;
                //    });
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("billing",
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

            scope.goToRefundReceiptURL = (item: RefundDTO): void => {
                var url = this.$state.href("billing-refund-document", { ticketIdentifier: scope.ticketIdentifier, transactionId: item.TransactionID });
                window.open(url, "_self");                
            }
        }
    }

    angular.module("app.staff")
        .directive("refundList",
        [
            "$state", "SessionService", "AuthService", "RefundService", "BillingQuery", 
            (t, s, auth, r, bq) => new RefundListDirective(t, s, auth, r, bq)
        ]);
}