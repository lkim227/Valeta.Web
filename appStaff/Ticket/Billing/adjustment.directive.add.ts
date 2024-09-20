module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface IAddAdjustmentAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IAddAdjustmentScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        ticketNumber: number;
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

        isInEditMode: boolean;

        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class AddAdjustmentDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appStaff/Ticket/Billing/adjustment.directive.add.html";
        scope = {
            isInEditMode: "=",
            ticketIdentifier: "=",
            ticketNumber: "=",
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

        link: ng.IDirectiveLinkFn = (scope: IAddAdjustmentScope, elements: ng.IAugmentedJQuery, attrs: IAddAdjustmentAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;

            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && !AppCommon.TicketUtils.isTicketClosed(scope.ticketStatus);

            scope.isInEditMode = false;
            scope.createdBy = this.sessionService.userInfo.employeeFriendlyID;
            scope.isAdjustmentForParkingCatchAll = true;
            scope.isAdjustmentForParkingAllowance = true;

            scope.onEdit = (): void => {
                scope.isInEditMode = true;
            }
            scope.onUpdate = (): void => {
                if (scope.adjustmentAmountCatchAll != 0 || scope.adjustmentAmountAllowance !== 0) {
                    var dto = new AdjustmentsForBothOrdersDTO();
                    dto.ID = scope.ticketIdentifier;
                    dto.CreatedBy = scope.createdBy;
                    dto.AccountID = scope.billing.AccountID;
                    dto.TicketNumber = scope.ticketNumber;

                    if (scope.adjustmentAmountCatchAll != 0) {
                        var adjustmentCatchAll = new AdjustmentDTO();
                        adjustmentCatchAll.Amount = scope.adjustmentAmountCatchAll;
                        adjustmentCatchAll.Description = scope.adjustmentDescriptionCatchAll;
                        adjustmentCatchAll.IsAppliedToParking = scope.isAdjustmentForParkingCatchAll;
                        if (!scope.isAdjustmentForParkingCatchAll) {
                            adjustmentCatchAll.ServiceTaskID = scope.selectedServiceTaskCatchAll.ServiceTaskID;
                            adjustmentCatchAll.TaxRate = scope.selectedServiceTaskCatchAll.TaxRate;
                        } else {
                            adjustmentCatchAll.TaxRate = scope.billing.FinancialConfiguration.TaxRatePercentage;
                        }

                        dto.PaymentMethodIDCatchAll = scope.billing.ReservationCatchAllOrder.PaymentMethodID;
                        dto.AdjustmentOnCatchAllOrder = adjustmentCatchAll;
                    }
                    if (scope.adjustmentAmountAllowance != 0 && !!scope.billing.ReservationAllowanceOrder) {
                        var adjustmentAllowance = new AdjustmentDTO();
                        adjustmentAllowance.Amount = scope.adjustmentAmountAllowance;
                        adjustmentAllowance.Description = scope.adjustmentDescriptionAllowance;
                        adjustmentAllowance.IsAppliedToParking = scope.isAdjustmentForParkingAllowance;
                        if (!scope.isAdjustmentForParkingAllowance) {
                            adjustmentAllowance.ServiceTaskID = scope.selectedServiceTaskListAllowance.ServiceTaskID;
                            adjustmentAllowance.TaxRate = scope.selectedServiceTaskListAllowance.TaxRate;
                        } else {
                            adjustmentAllowance.TaxRate = scope.billing.FinancialConfiguration.TaxRatePercentage;
                        }

                        dto.PaymentMethodIDAllowance = scope.billing.ReservationAllowanceOrder.PaymentMethodID;
                        dto.AdjustmentOnAllowanceOrder = adjustmentAllowance;
                    }

                    self.adjustmentService.addAdjustments(dto)
                        .then((data) => {
                            if (!data) {
                            }
                            this.$state.reload();
                        });
                }
                scope.isInEditMode = false;
            }
            scope.onCancel = (): void => {
                scope.isInEditMode = false;
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
        }
    }

    angular.module("app.staff")
        .directive("addAdjustment",
        [
            "$state", "SessionService", "AuthService", "AdjustmentService", "BillingQuery", 
            (t, s, auth, r, bq) => new AddAdjustmentDirective(t, s, auth, r, bq)
        ]);
}