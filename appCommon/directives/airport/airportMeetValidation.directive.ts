module AppCommon {
    export interface IAirportMeetValidationAttrs extends ng.IAttributes {
    }

    export interface IAirportMeetValidationScope extends ng.IScope {
        directiveInitialized: boolean;
        departureSpecifications: FlightSpecificationsDTO;
        departureSchedule: ScheduleDTO;
        returnSpecifications: FlightSpecificationsDTO;
        returnSchedule: ScheduleDTO;
        airportMeetError: string;
    }

    class AirportMeetValidation implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.airportMeetValidationTemplateUrl;
        scope = {
            departureSpecifications: "=",
            departureSchedule: "=",
            returnSpecifications: "=",
            returnSchedule: "="
        };

        static $inject = ["$timeout"];

        constructor(
            private timeout: ng.ITimeoutService) {
        }

        static instance(
            timeout: ng.ITimeoutService): ng.IDirectiveFactory {
            var directive: ng.IDirectiveFactory = () => new AirportMeetValidation(timeout);
            return directive;
        }

        link: ng.IDirectiveLinkFn = (scope: IAirportMeetValidationScope, elements: ng.IAugmentedJQuery, attrs: IAirportMeetValidationAttrs, ngModel: ng.INgModelController) => {

            var validateAirportMeet = (): void => {
                var tempFlightConsistencyValiation = "";
                if (!!scope.departureSpecifications
                    && !!scope.returnSpecifications
                    && !!scope.departureSpecifications.FlightNumber
                    && !!scope.returnSpecifications.FlightNumber
                    && !!scope.departureSpecifications.DateUsedToCalculateMeetTime
                    && !!scope.returnSpecifications.DateUsedToCalculateMeetTime) {

                    //Date.parse is not recommended but okay here since both dates are being parsed and just need relative difference
                    var departureDate = Date.parse(scope.departureSpecifications.DateUsedToCalculateMeetTime);
                    var returnDate = Date.parse(scope.returnSpecifications.DateUsedToCalculateMeetTime);
                    if (departureDate > returnDate) {
                        tempFlightConsistencyValiation = "date";
                    } else if (departureDate === returnDate
                        && !!scope.departureSchedule && !!scope.departureSchedule.ScheduleDateTime
                        && !!scope.returnSchedule && !!scope.returnSchedule.ScheduleDateTime) {

                        var departureTime = Date.parse(scope.departureSchedule.ScheduleDateTime);
                        var returnTime = Date.parse(scope.returnSchedule.ScheduleDateTime);
                        if (departureTime > returnTime) {
                            tempFlightConsistencyValiation = "time";
                        }
                    }
                }
                scope.airportMeetError = tempFlightConsistencyValiation;
            }

            var setupWatches = () => {
                var watches = [
                    "departureSpecifications.AirportCode",
                    "departureSpecifications.AirlineCode",
                    "departureSpecifications.FlightNumber",
                    "departureSpecifications.DateUsedToCalculateMeetTime",
                    "returnSpecifications.AirportCode",
                    "returnSpecifications.AirlineCode",
                    "returnSpecifications.FlightNumber",
                    "returnSpecifications.DateUsedToCalculateMeetTime",
                    "departureSchedule.ScheduleDateTime",
                    "returnSchedule.ScheduleDateTime"
                ];
                for (var i = 0; i < watches.length; i++) {
                    scope.$watch(watches[i],
                        () => {
                            validateAirportMeet();
                        });
                }
            }
            var initializeDirective = () => {
                setupWatches();
                scope.directiveInitialized = true;
            }

            this.timeout(initializeDirective, 0);
        };
    }

    angular.module("app.common")
        .directive("airportMeetValidation",
        ["$timeout", (t) => new AirportMeetValidation(t)]);
}