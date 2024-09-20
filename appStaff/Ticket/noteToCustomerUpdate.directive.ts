module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface INoteToCustomerUpdateAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface INoteToCustomerUpdateScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        textData: string;
        alertFlag: boolean;
        createdBy: string;

        utils: AppCommon.GenericUtils; // for html calls

        textDataCopy: string;
        isInEditMode: boolean;

        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class NoteToCustomerUpdateDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appStaff/Ticket/noteToCustomerUpdate.directive.html";
        scope = {
            ticketIdentifier: "=",
            textData: "=",
            alertFlag: "="
        };

        static $inject = ["$timeout", "SessionService", "ValetServiceCommand"];

        constructor(
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: INoteToCustomerUpdateScope, elements: ng.IAugmentedJQuery, attrs: INoteToCustomerUpdateAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;

            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate);
            scope.isInEditMode = false;
            scope.createdBy = this.sessionService.userInfo.employeeFriendlyID;

            var backupTextData = (): void => {
                scope.textDataCopy = utils.cloneObject(scope.textData);
            }
            var restoreTextData = (): void => {
                scope.textData = utils.cloneObject(scope.textDataCopy);
            }
            scope.onEdit = (): void => {
                backupTextData();
                scope.isInEditMode = true;
            }
            scope.onUpdate = (): void => {
                scope.canUpdate = false;
                scope.isInEditMode = false;
                var command = new ChangeNoteToCustomerCommandDTO();

                command.ID = scope.ticketIdentifier;
                command.CreatedBy = scope.createdBy;
                command.NoteToCustomer = scope.textData;
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
                var deregisterWait = scope.$watch("textData",
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
        .directive("noteToCustomerUpdate",
        [
            "$timeout", "SessionService", "ValetServiceCommand",
            (t, s, v) => new NoteToCustomerUpdateDirective(t, s, v)
        ]);
}