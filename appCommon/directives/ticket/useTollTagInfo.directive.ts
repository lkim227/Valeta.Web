module AppCommon {
    import utils = AppCommon.GenericUtils;

    export interface IUseTollTagInfoAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IUseTollTagInfoScope extends ng.IScope {
        ticketIdentifier: string;
        isTicketActive: boolean;
        useTollTag: boolean;

        utils: AppCommon.GenericUtils;

        directiveInitialized: boolean;

        canUpdate: boolean;
        isInEditMode: boolean;
        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class UseTollTagInfoDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.useTollTagInfoTemplateUrl;
        scope = {
            ticketIdentifier: "=",
            isTicketActive: "=",
            useTollTag: "="
        };

        static $inject = ["$timeout", "SessionService", "ValetServiceCommand"];

        constructor(
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: IUseTollTagInfoScope, elements: ng.IAugmentedJQuery, attrs: IUseTollTagInfoAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            var createdBy = this.sessionService.userInfo.employeeFriendlyID;

            var dataCopy: boolean;
            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && scope.isTicketActive;
            scope.isInEditMode = false;

            scope.utils = AppCommon.GenericUtils;

            var backupData = (): void => {
                dataCopy = utils.cloneObject(scope.useTollTag);
            }
            var restoreData = (): void => {
                scope.useTollTag = utils.cloneObject(dataCopy);
            }
            scope.onEdit = (): void => {
                backupData();
                scope.isInEditMode = true;
            }
            scope.onUpdate = (): void => {
                scope.canUpdate = false;
                scope.isInEditMode = false;
                var command = new ChangeUseTollTagCommandDTO();

                command.ID = scope.ticketIdentifier;
                command.CreatedBy = createdBy;
                command.UseTollTag = scope.useTollTag;
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
        .directive("useTollTagInfo",
        [
            "$timeout", "SessionService", "ValetServiceCommand",
            (t, s, v) => new UseTollTagInfoDirective(t, s, v)
        ]);
}