module AppCommon {
    import utils = AppCommon.GenericUtils;

    export interface INumberOfPeopleReturningInfoAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface INumberOfPeopleReturningInfoScope extends ng.IScope {
        ticketIdentifier: string;
        isTicketActive: boolean;
        infoModel: number;

        utils: AppCommon.GenericUtils;
        formMessages: AppCommon.FormMessages;

        directiveInitialized: boolean;

        canUpdate: boolean;
        isInEditMode: boolean;
        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class NumberOfPeopleReturningInfoDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.numberOfPeopleReturningInfoTemplateUrl;
        scope = {
            ticketIdentifier: "=",
            isTicketActive: "=",
            infoModel: "="
        };

        static $inject = ["$timeout", "SessionService", "ValetServiceCommand"];

        constructor(
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: INumberOfPeopleReturningInfoScope, elements: ng.IAugmentedJQuery, attrs: INumberOfPeopleReturningInfoAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            var createdBy = this.sessionService.userInfo.employeeFriendlyID;

            var dataCopy: boolean;
            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && scope.isTicketActive;
            scope.isInEditMode = false;

            scope.utils = AppCommon.GenericUtils;
            scope.formMessages = AppCommon.FormMessages;

            var backupData = (): void => {
                dataCopy = utils.cloneObject(scope.infoModel);
            }
            var restoreData = (): void => {
                scope.infoModel = utils.cloneObject(dataCopy);
            }
            scope.onEdit = (): void => {
                backupData();
                scope.isInEditMode = true;
            }
            scope.onUpdate = (): void => {
                scope.canUpdate = false;
                scope.isInEditMode = false;
                var command = new ChangeNumberOfPeopleReturningCommandDTO();

                command.ID = scope.ticketIdentifier;
                command.CreatedBy = createdBy;
                command.NumberOfPeopleReturning = scope.infoModel;
                self.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command)
                    .then((data) => {
                        if (!data) {
                            restoreData();
                        }
                        scope.canUpdate = true;
                    });
            }
            scope.onCancel = (): void => {
                restoreData();
                scope.isInEditMode = false;
            }
            var initializeDirective = () => {
                scope.directiveInitialized = true;
            }
            setTimeout(initializeDirective, 0);
        }
    }

    angular.module("app.common")
        .directive("numberOfPeopleReturningInfo",
        [
            "$timeout", "SessionService", "ValetServiceCommand",
            (t, s, v) => new NumberOfPeopleReturningInfoDirective(t, s, v)
        ]);
}