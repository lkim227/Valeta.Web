module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface IKeyLocationUpdateAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IKeyLocationUpdateScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        ticketStatus: TicketStatus;
        textData: string;
        ticketNumber: number;
        createdBy: string;

        utils: AppCommon.GenericUtils; // for html calls

        textDataCopy: string;
        isInEditMode: boolean;

        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class KeyLocationUpdateDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.keyLocationUpdateTemplateUrl;
        scope = {
            ticketIdentifier: "=",
            ticketStatus: "=",
            textData: "=",
            ticketNumber: "="
        };

        static $inject = ["$timeout", "SessionService", "ValetServiceCommand"];

        constructor(
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: IKeyLocationUpdateScope, elements: ng.IAugmentedJQuery, attrs: IKeyLocationUpdateAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;

            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && scope.ticketStatus < TicketStatus.Closed;
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
                var command = new SetKeysLocationAtBaseCommandDTO();

                command.ID = scope.ticketIdentifier;
                command.CreatedBy = scope.createdBy;
                command.KeysLocation = scope.textData;
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
        .directive("keyLocationUpdate",
        [
            "$timeout", "SessionService", "ValetServiceCommand",
            (t, s, v) => new KeyLocationUpdateDirective(t, s, v)
        ]);
}