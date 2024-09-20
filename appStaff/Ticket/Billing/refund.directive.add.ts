module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface IAddRefundAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IAddRefundScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        ticketNumber: number;
        ticketStatus: TicketStatus;
        catchAllCard: string;
        allowanceCard: string;
        billing: BillingQueryResult;
        createdBy: string;

        serviceTaskListCatchAll: ReservedServiceDTO[];
        serviceTaskListAllowance: ReservedServiceDTO[];
        serviceTaskList: ReservedServiceDTO[];

        showEditForm: boolean;
        isCatchAll: boolean;
        refundAmount: number;
        refundTaxRate: number;
        refundFeeRate: number;
        refundDescription: string;
        selectedServiceTask: ReservedServiceDTO;
        isRefundForParking: boolean;
        pendingRefunds: RefundDTO[];
        errorMessage: string;

        utils: AppCommon.GenericUtils; // for html calls
        
        isInEditMode: boolean;

        onEdit(): void;
        onCancel(): void;
        onProcessRefund(): void;

        onAddToPendingList(): void;
        onDeleteFromPendingList(index: number): void;
        onCancelAddToPendingList(): void;
        onClearEditForm(): void;
        setServices(): void;
        selectedServiceTaskChanged(): void;

        goToRefundReceiptURL(item: RefundDTO): void;
    }

    class AddRefundDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appStaff/Ticket/Billing/refund.directive.add.html";
        scope = {
            isInEditMode: "=",
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

        link: ng.IDirectiveLinkFn = (scope: IAddRefundScope, elements: ng.IAugmentedJQuery, attrs: IAddRefundAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;

            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && AppCommon.TicketUtils.isTicketClosed(scope.ticketStatus);

            scope.isInEditMode = false;
            scope.createdBy = this.sessionService.userInfo.employeeFriendlyID;
            scope.pendingRefunds = [];

            scope.onEdit = (): void => {
                scope.isInEditMode = true;
                scope.showEditForm = true;
            }
            scope.onClearEditForm = (): void => {
                scope.showEditForm = true;
                scope.errorMessage = null;

                scope.refundAmount = 0;
                scope.refundDescription = null;
                scope.selectedServiceTask = null;

                scope.isRefundForParking = true;
                scope.refundTaxRate = scope.billing.FinancialConfiguration.TaxRatePercentage;
                scope.refundFeeRate = scope.billing.FinancialConfiguration.FeePercentage;
            }
            scope.onAddToPendingList = (): void => {
                scope.showEditForm = false;

                if (scope.refundAmount > 0) {
                    var dto = new RefundDTO();
                    dto.Amount = scope.refundAmount;
                    dto.TaxRate = scope.refundTaxRate;
                    dto.FeeRate = scope.refundFeeRate;
                    dto.Description = scope.refundDescription;
                    dto.IsAppliedToParking = scope.isRefundForParking;
                    if (!scope.isRefundForParking) {
                        dto.ServiceTaskID = scope.selectedServiceTask.ServiceTaskID;
                        dto.ServiceTaskCategory = scope.selectedServiceTask.Category;
                    }
                    scope.pendingRefunds.push(dto);
                }
            }
            scope.onDeleteFromPendingList = (index: number): void => {
                scope.pendingRefunds.splice(index, 1);
                if (scope.pendingRefunds.length === 0) {
                    scope.pendingRefunds = [];
                    scope.onClearEditForm();
                }
            }
            scope.onCancelAddToPendingList = (): void => {
                scope.showEditForm = false;
                scope.onClearEditForm();
            }
            scope.setServices = (): void => {
                scope.serviceTaskList = [];
                if (scope.isCatchAll) scope.serviceTaskList = scope.serviceTaskListCatchAll;
                else scope.serviceTaskList = scope.serviceTaskListAllowance;
            }
            scope.selectedServiceTaskChanged = (): void => {
                scope.refundTaxRate = scope.selectedServiceTask.TaxRate;
                scope.refundFeeRate = 0;
            }

            scope.onProcessRefund = (): void => {
                if (scope.pendingRefunds.length > 0) {
                    var dto = new ProcessRefundsDTO();
                    dto.ID = scope.ticketIdentifier;
                    dto.CreatedBy = scope.createdBy;
                    dto.AccountID = scope.billing.AccountID;
                    dto.TicketNumber = scope.ticketNumber;
                    dto.IsCatchAllOrder = scope.isCatchAll;
                    if (scope.isCatchAll) {
                        dto.PaymentMethodID = scope.billing.ReservationCatchAllOrder.PaymentMethodID;
                        dto.TransactionIDForOriginalCharge = scope.billing.ReservationCatchAllOrder.PaymentTransactionId;
                    } else {
                        dto.PaymentMethodID = scope.billing.ReservationAllowanceOrder.PaymentMethodID;
                        dto.TransactionIDForOriginalCharge = scope.billing.ReservationAllowanceOrder.PaymentTransactionId;
                    }
                    dto.Refunds = scope.pendingRefunds;

                    self.refundService.processRefund(dto)
                        .then((errorMessage) => {
                            if (errorMessage === null) {
                                this.$state.reload();
                                scope.isInEditMode = false;
                            } else {
                                scope.errorMessage = errorMessage;
                            }
                        });
                }
            }
            scope.onCancel = (): void => {
                scope.isInEditMode = false;
            }
            var initializeDirective = () => {
                scope.directiveInitialized = true;

                if (!!scope.billing.ReservationCatchAllOrder.ReservedServices) {
                    scope.serviceTaskListCatchAll = scope.billing.ReservationCatchAllOrder.ReservedServices;
                }

                if (!!scope.billing.ReservationAllowanceOrder &&
                    !!scope.billing.ReservationAllowanceOrder.ReservedServices) {
                    scope.serviceTaskListAllowance = scope.billing.ReservationAllowanceOrder.ReservedServices;
                }
                if (typeof (scope.allowanceCard) === "undefined" || scope.allowanceCard === null || scope.allowanceCard.length < 1) {
                    scope.isCatchAll = true;
                    scope.setServices();
                }

                scope.onClearEditForm();

                scope.directiveInitialized = true;
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
        .directive("addRefund",
        [
            "$state", "SessionService", "AuthService", "RefundService", "BillingQuery", 
            (t, s, auth, r, bq) => new AddRefundDirective(t, s, auth, r, bq)
        ]);
}