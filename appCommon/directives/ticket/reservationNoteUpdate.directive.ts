module AppCommon {
    import utils = AppCommon.GenericUtils;

    export interface IReservationNoteUpdateAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IReservationNoteUpdateScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        isTicketActive: boolean;
        textData: string;
        createdBy: string;

        utils: AppCommon.GenericUtils; // for html calls

        textDataCopy: string;
        isInEditMode: boolean;

        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class ReservationNoteUpdateDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.reservationNoteUpdateTemplateUrl;
        scope = {
            ticketIdentifier: "=",
            isTicketActive: "=",
            textData: "="
        };

        static $inject = ["$timeout", "SessionService", "ValetServiceCommand"];

        constructor(
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: IReservationNoteUpdateScope, elements: ng.IAugmentedJQuery, attrs: IReservationNoteUpdateAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;

            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate); //per Haley's request && scope.isTicketActive;
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
                var command = new ChangeReservationNoteCommandDTO();

                command.ID = scope.ticketIdentifier;
                command.CreatedBy = scope.createdBy;
                command.ReservationNote = scope.textData;
                self.valetServiceCommand.doCommand("AirportTicketCommand", command)
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

    angular.module("app.common")
        .directive("reservationNoteUpdate",
        [
            "$timeout", "SessionService", "ValetServiceCommand",
            (t, s, v) => new ReservationNoteUpdateDirective(t, s, v)
        ]);
}