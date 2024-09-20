module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface IAddTipAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IAddTipScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        ticketStatus: TicketStatus;
        catchAllCard: string;
        allowanceCard: string;
        createdBy: string;

        tipRecipients: TipDTO[];
        showCards: boolean;
        isCatchAll: boolean;
        tipAmount: number;
        selectedEmployee: EmployeeDTO;
        employeeList: EmployeeDTO[];
        tipDescription: string;

        utils: AppCommon.GenericUtils; // for html calls
        
        isInEditMode: boolean;

        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class AddTipDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.tipAddTemplateUrl;
        scope = {
            isInEditMode: "=",
            ticketIdentifier: "=",
            ticketStatus: "=",
            catchAllCard: "=",
            allowanceCard: "="
        };

        static $inject = ["$state", "SessionService", "AuthService", "BillingCommand", "EmployeeRepository"];

        constructor(
            private $state: ng.ui.IStateService, 
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private billingCommand: AppCommon.BillingCommand,
            private employeeRepository: AppCommon.EmployeeRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IAddTipScope, elements: ng.IAugmentedJQuery, attrs: IAddTipAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;

            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && scope.ticketStatus < TicketStatus.Closed;

            scope.isInEditMode = false;
            scope.createdBy = this.sessionService.userInfo.employeeFriendlyID;
            scope.isCatchAll = true;

           scope.onEdit = (): void => {
                scope.isInEditMode = true;
            }
            scope.onUpdate = (): void => {
                var command = new AddTipCommandDTO();

                command.ID = scope.ticketIdentifier;
                command.CreatedBy = scope.createdBy;
                command.Tip = new PercentOrFlatAmountDTO();
                command.Tip.Amount = scope.tipAmount;
                command.Tip.IsPercentage = false;
                command.IsCatchAllOrder = scope.isCatchAll;
                command.ForGreeterFriendlyID = scope.selectedEmployee.FriendlyID;
                command.ForGreeterID = scope.selectedEmployee.ID;
                command.Description = scope.tipDescription;

                self.billingCommand.doCommand(command)
                    .then((data) => {
                        if (!data) {
                        }
                        this.$state.reload();
                        scope.isInEditMode = false;
                    });
            }
            scope.onCancel = (): void => {
                scope.isInEditMode = false;
            }
            var initializeDirective = () => {
                scope.directiveInitialized = true;
                scope.showCards = !!scope.allowanceCard && scope.allowanceCard.length > 0;

                this.employeeRepository.fetchAll(AppConfig.APIHOST)
                    .then((results) => {
                        scope.employeeList = results;
                    });
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
        .directive("addTip",
        [
            "$state", "SessionService", "AuthService", "BillingCommand", "EmployeeRepository",
            (t, s, auth, bc, e) => new AddTipDirective(t, s, auth, bc, e)
        ]);
}