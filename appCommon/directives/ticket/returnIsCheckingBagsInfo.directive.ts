﻿module AppCommon {
    import utils = AppCommon.GenericUtils;

    export interface IReturnIsCheckingBagsInfoAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IReturnIsCheckingBagsInfoScope extends ng.IScope {
        ticketIdentifier: string;
        isTicketActive: boolean;
        infoModel: boolean;

        utils: AppCommon.GenericUtils;

        directiveInitialized: boolean;

        canUpdate: boolean;
        isInEditMode: boolean;
        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class ReturnIsCheckingBagsInfoDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.returnIsCheckingBagsInfoTemplateUrl;
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

        link: ng.IDirectiveLinkFn = (scope: IReturnIsCheckingBagsInfoScope, elements: ng.IAugmentedJQuery, attrs: IReturnIsCheckingBagsInfoAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            var createdBy = this.sessionService.userInfo.employeeFriendlyID;

            var dataCopy: boolean;
            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && scope.isTicketActive;
            scope.isInEditMode = false;

            scope.utils = AppCommon.GenericUtils;

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
                var command = new ChangeGiveBackIsCheckingBagsCommandDTO();

                command.ID = scope.ticketIdentifier;
                command.CreatedBy = createdBy;
                command.GiveBackIsCheckingBags = scope.infoModel;
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
        .directive("returnIsCheckingBagsInfo",
        [
            "$timeout", "SessionService", "ValetServiceCommand",
            (t, s, v) => new ReturnIsCheckingBagsInfoDirective(t, s, v)
        ]);
}