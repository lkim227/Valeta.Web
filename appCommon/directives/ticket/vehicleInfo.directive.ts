module AppCommon {
    import utils = AppCommon.GenericUtils;

    export interface IVehicleInfoAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IVehicleInfoScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        isTicketActive: boolean;
        vehicle: VehicleDTO;
        accountIdentifier: string;

        isAccessedByStaff: boolean;

        utils: AppCommon.GenericUtils;
        formMessages: AppCommon.FormMessages;

        isInEditMode: boolean;
        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class VehicleInfoDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.vehicleInfoTemplateUrl;
        scope = {
            ticketIdentifier: "=",
            isTicketActive: "=",
            vehicle: "=",
            accountIdentifier: "="
        };

        static $inject = ["$timeout", "SessionService", "ValetServiceCommand"];

        constructor(
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: IVehicleInfoScope, elements: ng.IAugmentedJQuery, attrs: IVehicleInfoAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;
            scope.formMessages = AppCommon.FormMessages;

            var createdBy = this.sessionService.userInfo.employeeFriendlyID;
            scope.isAccessedByStaff = !!createdBy;

            var vehicleCopy: VehicleDTO;
            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && scope.isTicketActive;
            scope.isInEditMode = false;
            
            var backupTextData = (): void => {
                vehicleCopy = utils.cloneObject(scope.vehicle);
            }
            var restoreTextData = (): void => {
                scope.vehicle = utils.cloneObject(vehicleCopy);
            }
            scope.onEdit = (): void => {
                backupTextData();
                scope.isInEditMode = true;
            }
            scope.onUpdate = (): void => {
                scope.canUpdate = false;
                scope.isInEditMode = false;
                var command = new ChangeVehicleCommandDTO();

                command.ID = scope.ticketIdentifier;
                command.CreatedBy = createdBy;
                command.Vehicle = scope.vehicle;
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
        .directive("vehicleInfo",
        [
            "$timeout", "SessionService", "ValetServiceCommand",
            (t, s, v) => new VehicleInfoDirective(t, s, v)
        ]);
}