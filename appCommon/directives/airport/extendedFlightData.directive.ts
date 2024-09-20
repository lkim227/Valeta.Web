module AppCommon {
    import utils = AppCommon.GenericUtils;
    import flightUtils = AppCommon.FlightUtils;
    import dateTimeUtils = AppCommon.DateTimeUtils;

    export interface IExtendedFlightDataAttributes extends ng.IAttributes {
        canUpdate: string;
        reloadOnSave: string;
    }

    export interface IExtendedFlightDataScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        reloadOnSave: boolean;
        flightSpecifications: FlightSpecificationsDTO;
        flightSchedule: ScheduleDTO;
        flightStatus: FlightStatusDTO;
        ticketIdentifier: string;
        isTicketActive: boolean;
        returnIsCheckingBags: boolean;
        notifyBillingSummary: boolean;
        isAccessedByOffice: boolean;
        isReturn: boolean;
        isDeparture: boolean;

        utils: AppCommon.GenericUtils; // for html calls
        flightUtils: AppCommon.FlightUtils; // for html calls

        isInEditMode: boolean;
        showPageReloadWarning: boolean;

        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
        isValidFlight(): boolean;
    }

    class ExtendedFlightDataDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.extendedFlightDataTemplateUrl;
        scope = {
            ticketIdentifier: "=",
            isTicketActive: "=",
            flightSpecifications: "=",
            flightSchedule: "=",
            flightStatus: "=",
            returnIsCheckingBags: "=",
            notifyBillingSummary: "=?",
            isAccessedByOffice: "="
        };

        static $inject = ["$state", "$timeout", "dateFilter", "SessionService", "ValetServiceCommand"];

        constructor(
            private $state: ng.ui.IStateService, 
            private timeout: ng.ITimeoutService,
            private dateFilter: ng.IFilterDate,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: IExtendedFlightDataScope, elements: ng.IAugmentedJQuery, attrs: IExtendedFlightDataAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;
            scope.flightUtils = AppCommon.FlightUtils;

            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && scope.isTicketActive;
            scope.reloadOnSave = utils.getBooleanAttribute(attrs.reloadOnSave) && scope.isTicketActive;
            scope.isInEditMode = false;
            scope.showPageReloadWarning = false;

            var createdBy = this.sessionService.userInfo.customerFriendlyID;
            if (!!this.sessionService.userInfo.employeeID) {
                createdBy = this.sessionService.userInfo.employeeFriendlyID;
            }
            var flightSpecificationsCopy: FlightSpecificationsDTO;
            var flightScheduleCopy: ScheduleDTO;
            var flightStatusCopy: FlightStatusDTO;

            var canChangeFlight = () => {
                if (!!this.sessionService.userInfo.employeeID) {
                    return scope.canUpdate;
                } else if (!!scope.flightSpecifications) {
                    var now = new Date();
                    var yesterdayInMilliseconds = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
                        .getTime();
                    var flightdayInMilliseconds = DateTimeUtils
                        .isoDateStringToDateOnly(scope.flightSpecifications.DateUsedToCalculateMeetTime).getTime();
                    if (flightdayInMilliseconds < yesterdayInMilliseconds) {
                        return false;
                    }
                }
                return scope.canUpdate;
            }
            var backupFlightData = (): void => {
                flightSpecificationsCopy = angular.copy(scope.flightSpecifications);
                flightScheduleCopy = angular.copy(scope.flightSchedule);
                flightStatusCopy = angular.copy(scope.flightStatus);
            }
            var restoreFlightData = (): void => {
                scope.flightSpecifications = angular.copy(flightSpecificationsCopy);
                scope.flightSchedule = angular.copy(flightScheduleCopy);
                scope.flightStatus = angular.copy(flightStatusCopy);
            }
            scope.onEdit = (): void => {
                backupFlightData();
                if (GenericUtils.isUndefinedOrNull(scope.flightStatus)) {
                    scope.flightStatus = new FlightStatusDTO();
                    TicketUtils.setAllFieldsForConstructedFlightStatus(scope.flightStatus, scope.flightSchedule, createdBy);
                }               
                scope.isInEditMode = true;
            }
            scope.onUpdate = (): void => {
                scope.canUpdate = false;
                scope.isInEditMode = false;
                scope.showPageReloadWarning = scope.reloadOnSave;
                
                TicketUtils.setTimeFieldsForConstructedFlightStatus(scope.flightStatus, scope.flightSchedule, createdBy);
                var command: any;
                if (scope.flightSpecifications.FlightDirection === FlightDirection.Departure) {
                    command = new ChangeIntakeSpecificationsAndScheduleAndFlightStatusCommandDTO();
                } else {
                    command = new ChangeGiveBackSpecificationsAndScheduleAndFlightStatusCommandDTO();
                }

                command.ID = scope.ticketIdentifier;
                command.CreatedBy = createdBy;
                command.FlightSpecifications = scope.flightSpecifications;
                command.Schedule = scope.flightSchedule;
                command.FlightStatus = scope.flightStatus;
                self.valetServiceCommand.doCommand("AirportTicketCommand", command)
                    .then((data) => {
                        if (!data) {
                            restoreFlightData();
                        }
                        scope.notifyBillingSummary = true;
                        scope.canUpdate = true;
                        if (scope.reloadOnSave) {
                            this.$state.reload();
                        }                       
                    });
             }
            scope.onCancel = (): void => {
                restoreFlightData();
                scope.isInEditMode = false;
            }
            scope.isValidFlight = (): boolean => {
                return !!scope.flightSpecifications.FlightNumber
                    && scope.flightSpecifications.FlightNumber.length > 0;
                //null schedule is allowed
                    //&& (scope.flightSpecifications.FlightNumber === "0000"  
                        //|| (scope.flightSchedule.ScheduleDateTime
                        //    && scope.flightSchedule.ScheduleDateTime.length > 0))
            }
            var initializeDirective = () => {
                if (scope.canUpdate) {
                    scope.canUpdate = canChangeFlight();
                }
                scope.directiveInitialized = true;
            }
            var waitForScopeVariables = () => {
                var deregisterFlightSpecificationsWatch = scope.$watch("flightSpecifications",
                    (newValue) => {
                        if (typeof (newValue) !== "undefined") {
                            scope.$evalAsync(() => {
                                if (!!scope.flightSpecifications) {
                                    scope.isReturn = scope.flightSpecifications.FlightDirection === FlightDirection.Return;
                                    scope.isDeparture = scope.flightSpecifications.FlightDirection === FlightDirection.Departure;
                                }
                            });
                            deregisterFlightSpecificationsWatch();
                            initializeDirective();
                        }
                    });;
            }

            this.timeout(waitForScopeVariables, 0);

        }
    }

    angular.module("app.common")
        .directive("extendedFlightData",
        [
            "$state", "$timeout", "dateFilter", "SessionService", "ValetServiceCommand",
            (s, t, d, ss, v) => new ExtendedFlightDataDirective(s, t, d, ss, v)
        ]);
}