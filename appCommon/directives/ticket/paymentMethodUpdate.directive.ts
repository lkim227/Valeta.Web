module AppCommon {
    import utils = AppCommon.GenericUtils;

    export interface IPaymentMethodUpdateAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IPaymentMethodUpdateScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        isTicketActive: boolean;
        accountIdentifier: string;
        selectedPaymentMethodIdentifier: string;
        isCatchAllOrder: boolean;

        createdBy: string;

        selectedPaymentMethod: PaymentMethodDTO;
        paymentMethodList: PaymentMethodDTO[];

        utils: AppCommon.GenericUtils; // for html calls

        textDataCopy: string;
        isInEditMode: boolean;
        savingInProgress: boolean;

        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class PaymentMethodUpdateDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appCommon/directives/ticket/paymentMethodUpdate.directive.html";
        scope = {
            ticketIdentifier: "=",
            accountIdentifier: "=",
            selectedPaymentMethodIdentifier: "=",
            isCatchAllOrder: "=",
            isTicketActive: "="
        };

        static $inject = ["$timeout", "SessionService", "ValetServiceCommand", "PaymentMethodRepository"];

        constructor(
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand,
            private paymentMethodRepository: AppCommon.PaymentMethodRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IPaymentMethodUpdateScope, elements: ng.IAugmentedJQuery, attrs: IPaymentMethodUpdateAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;

            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && scope.isTicketActive;
            scope.isInEditMode = false;
            scope.createdBy = this.sessionService.userInfo.employeeFriendlyID;

            var setSelectedPaymentMethod = (): void => {
                if (!!scope.paymentMethodList && scope.paymentMethodList.length > 0) {
                    var found = IESafeUtils.arrayFind(scope.paymentMethodList, (x) => x.ID === scope.selectedPaymentMethodIdentifier, this);
                    scope.selectedPaymentMethod = found;                    
                }
            }
            var backupTextData = (): void => {
                scope.textDataCopy = utils.cloneObject(scope.selectedPaymentMethodIdentifier);
            }
            var restoreTextData = (): void => {
                scope.selectedPaymentMethodIdentifier = utils.cloneObject(scope.textDataCopy);
                setSelectedPaymentMethod();
            }
            scope.onEdit = (): void => {
                backupTextData();
                scope.isInEditMode = true;
            }
            scope.onUpdate = (): void => {
                scope.savingInProgress = true;
                scope.isInEditMode = false;
                if (!!scope.selectedPaymentMethod) {
                    var command = new ChangePaymentMethodCommandDTO();
                    command.ID = scope.ticketIdentifier.toString();
                    command.CreatedBy = scope.createdBy;
                    command.PaymentMethodID = scope.selectedPaymentMethod.ID;
                    command.PaymentMethodFriendlyName = scope.selectedPaymentMethod.FriendlyName;
                    command.IsCatchAllOrder = scope.isCatchAllOrder;
                    
                    self.valetServiceCommand.doCommand(CommonConfiguration_Routing.BillingCommandRoute, command)
                        .then((data) => {
                            if (!data) {
                                restoreTextData();
                            }
                            scope.savingInProgress = false;
                        });
                }
            }
            scope.onCancel = (): void => {
                restoreTextData();
                scope.isInEditMode = false;
            }

            var initializeDirective = () => {
                self.paymentMethodRepository.fetch(scope.accountIdentifier, AppConfig.APIHOST)
                    .then(data => {
                        scope.paymentMethodList = data;
                        setSelectedPaymentMethod();
                        scope.directiveInitialized = true;
                    });
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("selectedPaymentMethodIdentifier",
                    (newValue) => {
                        if (typeof (newValue) !== "undefined") {
                            deregisterWait();
                            initializeDirective();
                        }
                    });
            }
            var waitForDom = () => {
                waitForScopeVariables();
            }
            setTimeout(waitForDom, 0);
        }
    }

    angular.module("app.common")
        .directive("paymentMethodUpdate",
        [
            "$timeout", "SessionService", "ValetServiceCommand", "PaymentMethodRepository",
            (t, s, v, z) => new PaymentMethodUpdateDirective(t, s, v, z)
        ]);
}