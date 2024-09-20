module AppCommon {
    import utils = AppCommon.GenericUtils;

    export interface ICCEmailsUpdateAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface ICCEmailsUpdateScope extends ng.IScope {
        ticketIdentifier: string;
        textData: string;

        utils: AppCommon.GenericUtils;
        formMessages: AppCommon.FormMessages;

        directiveInitialized: boolean;

        adHocCommunicationUrl: string;

        canUpdate: boolean;
        isInEditMode: boolean;
        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class CCEmailsUpdateDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.ccEmailsUpdateTemplateUrl;
        scope = {
            ticketIdentifier: "=",
            textData: "="
        };

        static $inject = ["$timeout", "SessionService", "ValetServiceCommand"];

        constructor(
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: ICCEmailsUpdateScope, elements: ng.IAugmentedJQuery, attrs: ICCEmailsUpdateAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            var createdBy = this.sessionService.userInfo.employeeFriendlyID;

            var textDataCopy: string;
            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate);
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
                var command = new ChangeCCEmailsCommandDTO();

                command.ID = scope.ticketIdentifier;
                command.CreatedBy = createdBy;
                command.CCEmails = scope.textData;
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
            setTimeout(initializeDirective, 0);
        }
    }

    angular.module("app.common")
        .directive("ccEmailsUpdate",
        [
            "$timeout", "SessionService", "ValetServiceCommand",
            (t, s, v) => new CCEmailsUpdateDirective(t, s, v)
        ]);
}