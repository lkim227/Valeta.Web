module AppStaff {
    import utils = AppCommon.GenericUtils;
    import AppCommonConfig = AppCommon.AppCommonConfig;

    export interface IMeetDateTimeUpdateAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IMeetDateTimeUpdateScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        isTicketActive: boolean;
        dateTimeData: string;
        warningMessage: string;
        meetTimeLabel: string;
        travelDirection: TravelDirection;
        createdBy: string;

        utils: AppCommon.GenericUtils; // for html calls

        invalidDate: boolean;
        maxDateTime: Date;
        minDateTime: Date;

        dateTimeDataCopy: string;
        isInEditMode: boolean;

        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class MeetDateTimeUpdateDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.meetDateTimeUpdateTemplateUrl;
        scope = {
            ticketIdentifier: "=",
            isTicketActive: "=",
            dateTimeData: "=",
            warningMessage: "=",
            travelDirection: "="
        };

        static $inject = ["$timeout", "dateFilter", "SessionService", "ValetServiceCommand"];

        constructor(
            private timeout: ng.ITimeoutService,
            private dateFilter: ng.IFilterDate,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: IMeetDateTimeUpdateScope, elements: ng.IAugmentedJQuery, attrs: IMeetDateTimeUpdateAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;

            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && scope.isTicketActive;
            scope.isInEditMode = false;
            scope.createdBy = this.sessionService.userInfo.employeeFriendlyID;

            var dateTimePickerIdentifier: string;
            var backupData = (): void => {
                scope.dateTimeDataCopy = utils.cloneObject(scope.dateTimeData);
            }
            var restoreData = (): void => {
                scope.dateTimeData = utils.cloneObject(scope.dateTimeDataCopy);
            }
            var initializeDateTimePicker = () => {
                var now = new Date();
                var minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                var maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59);
                var dateValue: Date = null;
                if (!!scope.dateTimeData) {
                    dateValue = new Date(scope.dateTimeData);
                    if (minDate > dateValue) {
                        minDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
                    }
                    if (maxDate < dateValue) {
                        maxDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate() + 1, 23, 59);
                    }
                }

                $(dateTimePickerIdentifier).kendoDateTimePicker({
                    min: minDate,
                    max: maxDate,
                    value: dateValue
                });
            }
            scope.onEdit = (): void => {
                backupData();
                initializeDateTimePicker();
                scope.isInEditMode = true;
            }
            scope.onUpdate = (): void => {
                var dateTimePickerValue = $(dateTimePickerIdentifier).data("kendoDateTimePicker").value();
                if (utils.isUndefinedOrNull(dateTimePickerValue)) {
                    return;
                }
                scope.dateTimeData = this.dateFilter(dateTimePickerValue, AppCommonConfig.isoDateTimeFormat);
                scope.canUpdate = false;
                scope.isInEditMode = false;

                var command: any;
                if (scope.travelDirection === TravelDirection.FromCustomer) {
                    command = new ChangeIntakeScheduleCommandDTO();
                } else {
                    command = new ChangeGiveBackScheduleCommandDTO();
                }

                command.ID = scope.ticketIdentifier;
                command.CreatedBy = scope.createdBy;
                command.Schedule = new ScheduleDTO();
                command.Schedule.ScheduleDateTime = scope.dateTimeData;
                self.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command)
                    .then((success) => {
                        if (!success) {
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
                if (scope.travelDirection === TravelDirection.FromCustomer) {
                    scope.meetTimeLabel = AppCommon.FlightUtils.flightDirectionToString(FlightDirection.Departure);
                } else if (scope.travelDirection === TravelDirection.ToCustomer) {
                    scope.meetTimeLabel = AppCommon.FlightUtils.flightDirectionToString(FlightDirection.Return);
                } else {
                    scope.meetTimeLabel = "";
                }
                dateTimePickerIdentifier = "#meetdatetime-" + scope.travelDirection;
                scope.directiveInitialized = true;
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("dateTimeData",
                    (newValue) => {
                        if (typeof (newValue) !== "undefined") {
                            deregisterWait();
                            initializeDirective();
                        }
                    });;
            }
            var waitForDom = () => {
                waitForScopeVariables();
            }

            setTimeout(waitForDom, 0);
        }
    }

    angular.module("app.staff")
        .directive("meetDateTimeUpdate",
        [
            "$timeout", "dateFilter", "SessionService", "ValetServiceCommand",
            (t, d, s, v) => new MeetDateTimeUpdateDirective(t, d, s, v)
        ]);
}