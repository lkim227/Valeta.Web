module AppCommon {
    import utils = AppCommon.GenericUtils;

    export interface IKeyTagUpdateAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IKeyTagUpdateScope extends ng.IScope {
        ticketIdentifier: string;
        isTicketActive: boolean;
        textData: string;

        utils: AppCommon.GenericUtils;
        formMessages: AppCommon.FormMessages;

        directiveInitialized: boolean;

        canUpdate: boolean;
        isInEditMode: boolean;
        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class KeyTagUpdateDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.keyTagUpdateTemplateUrl;
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

        link: ng.IDirectiveLinkFn = (scope: IKeyTagUpdateScope, elements: ng.IAugmentedJQuery, attrs: IKeyTagUpdateAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            var createdBy = this.sessionService.userInfo.employeeFriendlyID;

            var textDataCopy: string;
            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && scope.isTicketActive;
            scope.isInEditMode = false;

            scope.utils = AppCommon.GenericUtils;
            scope.formMessages = AppCommon.FormMessages;

            var backupTextData = (): void => {
                textDataCopy = utils.cloneObject(scope.textData);
            }
            var restoreTextData = (): void => {
                scope.textData = utils.cloneObject(textDataCopy);
            }
            scope.onEdit = (): void => {
                backupTextData();
                scope.isInEditMode = true;
            }
            scope.onUpdate = (): void => {
                scope.canUpdate = false;
                scope.isInEditMode = false;
                var command = new ChangeKeyTagCommandDTO();

                command.ID = scope.ticketIdentifier;
                command.CreatedBy = createdBy;
                command.KeyTag = scope.textData;
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
            setTimeout(initializeDirective, 0);
        }
    }

    angular.module("app.common")
        .directive("keyTagUpdate",
        [
            "$timeout", "SessionService", "ValetServiceCommand",
            (t, s, v) => new KeyTagUpdateDirective(t, s, v)
        ]);
}