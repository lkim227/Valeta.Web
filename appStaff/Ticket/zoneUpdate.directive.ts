module AppStaff {
    import utils = AppCommon.GenericUtils;
    import flightUtils = AppCommon.FlightUtils;

    export interface IZoneUpdateAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IZoneUpdateScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        ticketStatus: TicketStatus;
        operatingLocationIdentifier: string;
        zoneIdentifier: string;
        zoneWarningMessage: string;
        flightDirection: number;
        createdBy: string;

        selectedZone: ZoneDTO;
        zoneList: ZoneDTO[];

        utils: AppCommon.GenericUtils; // for html calls
        flightUtils: AppCommon.FlightUtils; // for html calls

        textDataCopy: string;
        isInEditMode: boolean;
        savingInProgress: boolean;

        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
        onClearZoneWarningMessage(): void;
    }

    class ZoneUpdateDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.zoneUpdateTemplateUrl;
        scope = {
            ticketIdentifier: "=",
            ticketStatus: "=",
            operatingLocationIdentifier: "=",
            zoneIdentifier: "=",
            zoneWarningMessage: "=",
            flightDirection: "="
        };

        static $inject = ["$timeout", "SessionService", "ValetServiceCommand", "ZoneRepository"];

        constructor(
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand,
            private zoneRepository: AppCommon.ZoneRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IZoneUpdateScope, elements: ng.IAugmentedJQuery, attrs: IZoneUpdateAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;
            scope.flightUtils = AppCommon.FlightUtils;

            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && scope.ticketStatus < TicketStatus.CannotClose;
            if (scope.flightDirection === FlightDirection.Departure) {
                scope.canUpdate = scope.canUpdate && scope.ticketStatus < TicketStatus.Outgoing;
            }
            scope.isInEditMode = false;
            scope.createdBy = this.sessionService.userInfo.employeeFriendlyID;

            var setSelectedZone = (): void => {
                if (!!scope.zoneList && scope.zoneList.length > 0) {
                    var matchingZone = scope.zoneList.filter(x => x.ID === scope.zoneIdentifier);
                    if (matchingZone.length === 1) {
                        scope.selectedZone = matchingZone[0];
                    }
                }
            }
            var backupTextData = (): void => {
                scope.textDataCopy = utils.cloneObject(scope.zoneIdentifier);
            }
            var restoreTextData = (): void => {
                scope.zoneIdentifier = utils.cloneObject(scope.textDataCopy);
                setSelectedZone();
            }
            scope.onEdit = (): void => {
                backupTextData();
                scope.isInEditMode = true;
            }
            scope.onUpdate = (): void => {
                scope.savingInProgress = true;
                scope.isInEditMode = false;
                if (!!scope.selectedZone) {
                    var command: any;
                    if (scope.flightDirection === FlightDirection.Departure) {
                        command = new ChangeIntakeZoneCommandDTO();
                    } else {
                        command = new ChangeGiveBackZoneCommandDTO();
                    }

                    command.ID = scope.ticketIdentifier.toString();
                    command.CreatedBy = scope.createdBy;
                    command.ZoneID = scope.selectedZone.ID;
                    command.ZoneCode = scope.selectedZone.Code;
                    self.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command)
                        .then((data) => {
                            if (!data) {
                                restoreTextData();
                            }
                            scope.zoneWarningMessage = null;
                            scope.savingInProgress = false;
                        });
                }
            }
            scope.onCancel = (): void => {
                restoreTextData();
                scope.isInEditMode = false;
            }
            scope.onClearZoneWarningMessage = (): void => {
                var command: any;
                if (scope.flightDirection === FlightDirection.Departure) {
                    command = new ChangeIntakeZoneWarningMessageCommandDTO();
                } else {
                    command = new ChangeGiveBackZoneWarningMessageCommandDTO();
                }

                command.ID = scope.ticketIdentifier.toString();
                command.CreatedBy = scope.createdBy;
                command.WarningMessage = null;
                self.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command)
                    .then((data) => {
                        if (!data) {
                            restoreTextData();
                        }
                        scope.zoneWarningMessage = null;
                        scope.savingInProgress = false;
                    });
            }

            var initializeDirective = () => {
                self.zoneRepository.getByOperatingLocationID(scope.operatingLocationIdentifier)
                    .then(data => {
                        scope.zoneList = data;
                        setSelectedZone();
                        scope.directiveInitialized = true;
                    });
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("zoneIdentifier",
                    (newValue) => {
                        if (typeof (newValue) !== "undefined") {
                            deregisterWait();
                            initializeDirective();
                        }
                    });
            }
            var waitForDom = () => {
                waitForScopeVariables();
            }
            setTimeout(waitForDom, 0);
        }
    }

    angular.module("app.staff")
        .directive("zoneUpdate",
        [
            "$timeout", "SessionService", "ValetServiceCommand", "ZoneRepository",
            (t, s, v, z) => new ZoneUpdateDirective(t, s, v, z)
        ]);
}