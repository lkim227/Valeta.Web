module AppCommon {
    import utils = AppCommon.GenericUtils;

    export interface IMobilePhoneUpdateAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IMobilePhoneUpdateScope extends ng.IScope {
        identifier: string;
        context: string;
        textData: string;
        customerName: string;
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

    class MobilePhoneUpdateDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.mobilePhoneUpdateTemplateUrl;
        scope = {
            identifier: "=",
            context: "=",
            textData: "=",
            customerName: "=",
            canContact: "="
        };

        static $inject = ["$timeout", "SessionService", "ValetServiceCommand"];

        constructor(
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: IMobilePhoneUpdateScope, elements: ng.IAugmentedJQuery, attrs: IMobilePhoneUpdateAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            var createdBy = this.sessionService.userInfo.employeeFriendlyID;

            var textDataCopy: string;
            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate);
            scope.isInEditMode = false;

            scope.utils = AppCommon.GenericUtils;
            scope.formMessages = AppCommon.FormMessages;
            if (scope.canContact == null) scope.canContact = true;
            if (scope.canContact) {
                if (!!scope.context && scope.context.length <= 0) {
                    scope.context = AppCommon.CommunicationUtils.referenceContextTicket;
                }
                scope.adHocCommunicationUrl = AppCommon.CommunicationUtils.buildAdHocCommunicationUrl(scope.context);
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
                if (!!scope.textData && scope.textData.length > 0) {
                    scope.canUpdate = false;
                    scope.isInEditMode = false;
                    var command = new ChangeMobilePhoneCommandDTO();

                    command.ID = scope.identifier;
                    command.CreatedBy = createdBy;
                    command.MobilePhone = scope.textData;
                    self.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command)
                        .then((data) => {
                            if (!data) {
                                restoreTextData();
                            }
                            scope.canUpdate = true;
                        });
                }
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
        .directive("mobilePhoneUpdate",
        [
            "$timeout", "SessionService", "ValetServiceCommand",
            (t, s, v) => new MobilePhoneUpdateDirective(t, s, v)
        ]);
}