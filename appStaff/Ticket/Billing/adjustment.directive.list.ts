module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface IAdjustmentListScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        ticketStatus: TicketStatus;
        catchAllCard: string;
        catchAllAdjustments: AdjustmentDTO[];
        allowanceCard: string;
        allowanceAdjustments: AdjustmentDTO[];
        billing: BillingQueryResult;
        createdBy: string;
        
        showCards: boolean;
        adjustmentAmountCatchAll: number;
        adjustmentDescriptionCatchAll: string;
        serviceTaskListCatchAll: ReservedServiceDTO[];
        selectedServiceTaskCatchAll: ReservedServiceDTO;
        isAdjustmentForParkingCatchAll: boolean;

        adjustmentAmountAllowance: number;
        adjustmentDescriptionAllowance: string;
        serviceTaskListAllowance: ReservedServiceDTO[];
        selectedServiceTaskListAllowance: ReservedServiceDTO;
        isAdjustmentForParkingAllowance: boolean;

        utils: AppCommon.GenericUtils; // for html calls

        onDelete(item: AdjustmentDTO, isCatchAllOrder: boolean): void;
    }

    class AdjustmentListDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appStaff/Ticket/Billing/adjustment.directive.list.html";
        scope = {
            ticketIdentifier: "=",
            ticketStatus: "=",
            catchAllCard: "=",
            allowanceCard: "=",
            billing: "="
        };

        static $inject = ["$state", "SessionService", "AuthService", "AdjustmentService", "BillingQuery"];

        constructor(
            private $state: ng.ui.IStateService, 
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private adjustmentService: AppStaff.AdjustmentService,
            private billingQuery: AppCommon.BillingQuery) {
        }

        link: ng.IDirectiveLinkFn = (scope: IAdjustmentListScope) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;
            
            scope.isAdjustmentForParkingCatchAll = true;
            scope.isAdjustmentForParkingAllowance = true;
            
            scope.onDelete = (item: AdjustmentDTO, isCatchAllOrder: boolean): void => {
                var response = confirm("Are you sure you want to delete " + item.Description + " adjustment for $" + item.Amount + "?");
                if (response === false) {
                    return;
                }

                var command = new DeleteAdjustmentCommandDTO();
                command.ID = scope.ticketIdentifier;
                command.CreatedBy = scope.createdBy;
                command.Adjustment = item;
                command.IsCatchAllOrder = isCatchAllOrder;

                self.adjustmentService.deleteAdjustment(command)
                    .then(() => {
                        this.$state.reload();
                    });
            }

            var initializeDirective = () => {
                scope.directiveInitialized = true;

                scope.showCards = !!scope.allowanceCard && scope.allowanceCard.length > 0;

                if (!!scope.billing.ReservationCatchAllOrder.Adjustments) {
                    scope.catchAllAdjustments = scope.billing.ReservationCatchAllOrder.Adjustments;
                }
                if (!!scope.billing.ReservationAllowanceOrder && !!scope.billing.ReservationAllowanceOrder.Adjustments) {
                    scope.allowanceAdjustments = scope.billing.ReservationAllowanceOrder.Adjustments;
                }

                if (!!scope.billing.ReservationCatchAllOrder.ReservedServices) {
                    scope.serviceTaskListCatchAll = scope.billing.ReservationCatchAllOrder.ReservedServices;
                }
                if (!!scope.billing.ReservationAllowanceOrder &&
                    !!scope.billing.ReservationAllowanceOrder.ReservedServices) {
                    scope.serviceTaskListAllowance = scope.billing.ReservationAllowanceOrder.ReservedServices;
                }
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
        }
    }

    angular.module("app.staff")
        .directive("adjustmentList",
        [
            "$state", "SessionService", "AuthService", "AdjustmentService", "BillingQuery", 
            (t, s, auth, r, bq) => new AdjustmentListDirective(t, s, auth, r, bq)
        ]);
}