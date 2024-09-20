module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface IIntakeOffsetUpdateAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IIntakeOffsetUpdateScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        isTicketActive: boolean;
        numberData: number;
        ticketNumber: number;
        createdBy: string;

        utils: AppCommon.GenericUtils; // for html calls

        numberDataCopy: string;
        isInEditMode: boolean;

        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class IntakeOffsetUpdateDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appStaff/Ticket/intakeOffsetUpdate.directive.html";
        scope = {
            ticketIdentifier: "=",
            isTicketActive: "=",
            numberData: "="
        };

        static $inject = ["$timeout", "SessionService", "ValetServiceCommand"];

        constructor(
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: IIntakeOffsetUpdateScope, elements: ng.IAugmentedJQuery, attrs: IIntakeOffsetUpdateAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;

            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && scope.isTicketActive;
            scope.isInEditMode = false;
            scope.createdBy = this.sessionService.userInfo.employeeFriendlyID;

            var backupTextData = (): void => {
                scope.numberDataCopy = utils.cloneObject(scope.numberData);
            }
            var restoreTextData = (): void => {
                scope.numberData = utils.cloneObject(scope.numberDataCopy);
            }
            scope.onEdit = (): void => {
                backupTextData();
                scope.isInEditMode = true;
            }
            scope.onUpdate = (): void => {
                scope.canUpdate = false;
                scope.isInEditMode = false;
                var command = new ChangeIntakeOffsetCommandDTO();

                command.ID = scope.ticketIdentifier;
                command.CreatedBy = scope.createdBy;
                command.OffsetMinutes = scope.numberData;
                self.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command)
                    .then((data) => {
                        if (!data) {
                            restoreTextData();
                        }
                        scope.canUpdate = true;
                    });
            }
            scope.onCancel = (): void => {
                restoreTextData();
                scope.isInEditMode = false;
            }
            var initializeDirective = () => {


                scope.directiveInitialized = true;
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("numberData",
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
        .directive("intakeOffsetUpdate",
        [
            "$timeout", "SessionService", "ValetServiceCommand",
            (t, s, v) => new IntakeOffsetUpdateDirective(t, s, v)
        ]);
}