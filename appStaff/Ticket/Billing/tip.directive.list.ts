module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface ITipListScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        isTicketActive: boolean;
        catchAllCard: string;
        catchAllTips: TipDTO[];
        allowanceCard: string;
        allowanceTips: TipDTO[];
        billing: BillingQueryResult;
        createdBy: string;

        showCards: boolean;

        utils: AppCommon.GenericUtils; // for html calls

        onDelete(item: TipDTO, isCatchAllOrder: boolean): void;
    }

    class TipListDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.tipListTemplateUrl;
        scope = {
            ticketIdentifier: "=",
            isTicketActive: "=",
            catchAllCard: "=",
            allowanceCard: "=",
            billing: "="
        };

        static $inject = ["$state", "SessionService", "AuthService", "BillingCommand", "TicketTipQuery"];

        constructor(
            private $state: ng.ui.IStateService, 
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private billingCommand: AppCommon.BillingCommand,
            private ticketTipQuery: AppCommon.TicketTipQuery) {
        }

        link: ng.IDirectiveLinkFn = (scope: ITipListScope) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;

            scope.onDelete = (item: TipDTO, isCatchAllOrder: boolean): void => {
                var response = confirm("Are you sure you want to delete " + item.Description + " tip for $" + item.Amount + "?");
                if (response === false) {
                    return;
                }

                var command = new DeleteTipCommandDTO();
                command.ID = scope.ticketIdentifier;
                command.CreatedBy = scope.createdBy;
                command.Tip = item;
                command.IsCatchAllOrder = isCatchAllOrder;

                self.billingCommand.doCommand(command)
                    .then(() => {
                        this.$state.reload();
                    });
            }
         
            var initializeDirective = () => {
                scope.directiveInitialized = true;
                scope.showCards = !!scope.allowanceCard && scope.allowanceCard.length > 0;

                if (!!scope.billing.ReservationCatchAllOrder.TipBreakdown) {
                    scope.catchAllTips = scope.billing.ReservationCatchAllOrder.TipBreakdown;
                }
                if (!!scope.billing.ReservationAllowanceOrder && !!scope.billing.ReservationAllowanceOrder.TipBreakdown) {
                    scope.allowanceTips = scope.billing.ReservationAllowanceOrder.TipBreakdown;
                }
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("catchAllCard",
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
        .directive("tipList",
        [
            "$state", "SessionService", "AuthService", "BillingCommand", "TicketTipQuery",
            (t, s, auth, bc, tt) => new TipListDirective(t, s, auth, bc, tt)
        ]);
}