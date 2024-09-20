module AppCommon {
    import utils = AppCommon.GenericUtils;

    export interface IEmailAddressUpdateAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IEmailAddressUpdateScope extends ng.IScope {
        ticketIdentifier: string;
        textData: string;
        canContact: boolean;

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

    class EmailAddressUpdateDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.emailAddressUpdateTemplateUrl;
        scope = {
            ticketIdentifier: "=",
            textData: "=",
            canContact: "="
        };

        static $inject = ["$timeout", "SessionService", "ValetServiceCommand"];

        constructor(
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: IEmailAddressUpdateScope, elements: ng.IAugmentedJQuery, attrs: IEmailAddressUpdateAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            var createdBy = this.sessionService.userInfo.employeeFriendlyID;

            var textDataCopy: string;
            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate);
            scope.isInEditMode = false;

            scope.utils = AppCommon.GenericUtils;
            scope.formMessages = AppCommon.FormMessages;
            if (scope.canContact == null) scope.canContact = true;
            if (scope.canContact) {
                scope.adHocCommunicationUrl = AppCommon.CommunicationUtils.buildAdHocCommunicationUrl(AppCommon.CommunicationUtils.referenceContextTicket);
            }

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
                var command = new ChangeEmailAddressCommandDTO();

                command.ID = scope.ticketIdentifier;
                command.CreatedBy = createdBy;
                command.EmailAddress = scope.textData;
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
        .directive("emailAddressUpdate",
        [
            "$timeout", "SessionService", "ValetServiceCommand",
            (t, s, v) => new EmailAddressUpdateDirective(t, s, v)
        ]);
}