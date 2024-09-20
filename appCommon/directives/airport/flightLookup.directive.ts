module AppCommon {
    export interface IFlightLookupAttrs extends ng.IAttributes {
    }

    export interface IFlightLookupScope extends ng.IScope {
        flightSpecifications: FlightSpecificationsDTO;
        flightSchedule: ScheduleDTO;
        flightDirectionToString(ndx: number): string;
        directiveInitialized: boolean;
        missingSchedule: boolean;
        invalidDate: boolean;
        datepickerOnclose(): void;

        maxMeetDate: Date;
        minMeetDate: Date;

        updateFlightSchedule(): void;
    }

    class FlightLookup implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.flightLookupTemplateUrl;
        scope = {
            flightSpecifications: "=",
            flightSchedule: "="
        };

        static $inject = ["$timeout", "dateFilter", "SystemConfigurationService", "SessionService", "FlightStatsService", "DefinedListRepository"];

        constructor(
            private timeout: ng.ITimeoutService,
            private dateFilter: ng.IFilterDate,
            private systemConfigurationService: AppCommon.SystemConfigurationService,
            private sessionService: AppCommon.SessionService,
            private flightStatsService: AppCommon.FlightStatsService)
        {}

        static instance(
            timeout: ng.ITimeoutService,
            dtFilter: ng.IFilterDate,
            scService: AppCommon.SystemConfigurationService,
            ssService: AppCommon.SessionService,
            fsService: AppCommon.FlightStatsService,
            dlRepository: AppCommon.DefinedListRepository): ng.IDirectiveFactory {
            var directive: ng.IDirectiveFactory = () => new FlightLookup(timeout, dtFilter, scService, ssService, fsService);
            return directive;
        }

        link: ng.IDirectiveLinkFn = (scope: IFlightLookupScope, elements: ng.IAugmentedJQuery, attrs: IFlightLookupAttrs, ngModel: ng.INgModelController) => {
            var datepicker: string;
            scope.missingSchedule = false;
            scope.invalidDate = false;

            scope.flightDirectionToString = (ndx: number): string => {
                return FlightDirection[ndx];
            }

            scope.updateFlightSchedule = () => {
                if (!!scope.flightSpecifications &&
                    !!scope.flightSpecifications.AirlineCode && scope.flightSpecifications.AirlineCode.length > 0 &&
                    !!scope.flightSpecifications.AirportCode && scope.flightSpecifications.AirportCode.length > 0 &&
                    !!scope.flightSpecifications.FlightNumber && scope.flightSpecifications.FlightNumber.length > 0 &&
                    !!scope.flightSpecifications.DateUsedToCalculateMeetTime && scope.flightSpecifications.DateUsedToCalculateMeetTime.length > 0) {

                    if (scope.flightSpecifications.FlightNumber === "0000") {
                        scope.$evalAsync(() => {
                            scope.flightSchedule.ScheduleDateTime = "";
                            scope.missingSchedule = false;
                        });
                    } else {
                        scope.$evalAsync(() => {
                            this.flightStatsService.getFlightSchedule(scope.flightSpecifications)
                                .then((data: ScheduleDTO) => {
                                    // If flightSchedule is not null, replace only FlightTime and not the whole object.
                                    // Replacing the whole object works when flightLookup is used in MakeReservation, but
                                    // not when it is used by singleTicket via the extendedFlightData directive.
                                    scope.$evalAsync(() => {
                                        if (scope.flightSchedule === null) {
                                            scope.flightSchedule = data;
                                        } else {
                                            if (!!data) {
                                                scope.flightSchedule.ScheduleDateTime = data.ScheduleDateTime;
                                            }
                                        }

                                        if (!!scope.flightSchedule && !!scope.flightSchedule.ScheduleDateTime) {
                                            scope.missingSchedule = false;
                                        } else {
                                            scope.missingSchedule = true;

                                            if (!!this.sessionService.userInfo.employeeID) {
                                                scope.flightSchedule = new ScheduleDTO();
                                                scope.flightSchedule.ScheduleDateTime = scope.flightSpecifications.DateUsedToCalculateMeetTime;
                                                scope.missingSchedule = false;
                                            }
                                        }
                                    });
                                });
                        });
                    }
                } else {
                    scope.flightSchedule.ScheduleDateTime = "";
                    scope.missingSchedule = false;
                }
            };

            var validateAndFormatDateUsedToCalculateMeetTime = () => {
                var datepickerValue = $(datepicker).data("kendoDatePicker").value();
                if (!!datepickerValue) {
                    scope.invalidDate = false;
                    scope.flightSpecifications.DateUsedToCalculateMeetTime = this.dateFilter(datepickerValue, AppCommon.AppCommonConfig.isoDateOnlyFormat);
                } else {
                    scope.invalidDate = true;
                    scope.flightSpecifications.DateUsedToCalculateMeetTime = null;
                }
            }

            scope.datepickerOnclose = (): void => {
                validateAndFormatDateUsedToCalculateMeetTime();
                scope.updateFlightSchedule();
            };

            var initializeDatePicker = () => {
                datepicker = "#meetdate-" + scope.flightSpecifications.FlightDirection;
                var now = new Date();

                //employees can make reservations in the past
                if (!!this.sessionService.userInfo.employeeID) {
                    scope.minMeetDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                } else {
                    scope.minMeetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                }

                scope.maxMeetDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
                var defaultMeetDate = scope.minMeetDate;
                if (!!scope.flightSpecifications.DateUsedToCalculateMeetTime) {
                    scope.flightSpecifications.DateUsedToCalculateMeetTime = this.dateFilter(
                        scope.flightSpecifications.DateUsedToCalculateMeetTime,
                        AppCommonConfig.isoDateOnlyFormat);
                }
                $(datepicker).blur(() => {
                    validateAndFormatDateUsedToCalculateMeetTime();
                    scope.updateFlightSchedule();
                });
            }

            var setupWatches = () => {
                // Do not watch DateUsedToCalculateMeetTime as it is being handled through the datepicker
                var watches = ["flightSpecifications.AirportCode", "flightSpecifications.AirlineCode"];
                for (var i = 0; i < watches.length; i++) {
                    scope.$watch(watches[i],
                        () => {
                            scope.updateFlightSchedule();
                        });;
                }
            }

            var initializeDirective = () => {
                initializeDatePicker();
                setupWatches();

                var flightnumber = "#flightnumber-" + scope.flightSpecifications.FlightDirection;
                $(flightnumber).blur(() => {
                    scope.updateFlightSchedule();
                });

                scope.directiveInitialized = true;
            }

            this.timeout(initializeDirective, 0);
        };
    }

    angular.module("app.common")
        .directive("flightLookup",
        ["$timeout", "dateFilter", "SystemConfigurationService", "SessionService", "FlightStatsService",
            (timeout, dtFilter, scService, ssService, fsService) => new FlightLookup(timeout, dtFilter, scService, ssService, fsService)]);
}