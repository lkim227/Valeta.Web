module AppCommon {
    export interface IFlightStatsRepository extends RestClientBase {
    }

    export interface IFlightStatsService extends ng.resource.IResourceClass<IFlightStatsRepository> {
        getFlightSchedule?: angular.resource.IResourceMethod<IFlightStatsRepository>;
    }

    export class FlightStatsService {
        static $inject = ["Restangular", "ErrorHandlingService"];

        constructor(protected restng: restangular.IService, protected errorHandlingService: ErrorHandlingService) {
        }

        getFlightSchedule(flightStatsQuery: FlightSpecificationsDTO): ng.IPromise<ScheduleDTO> {
            return this.restng
                .one("FlightStats/GetFlightSchedule")
                .customPOST(flightStatsQuery)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason.data, "We could not retrieve flight schedule information.");
                    return null;
                });
        }

        getFlightStatus(flightStatsQuery: FlightSpecificationsDTO): ng.IPromise<FlightStatusDTO> {
            return this.restng
                .one("FlightStats/GetFlightStatus")
                .customPOST(flightStatsQuery)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason.data, "We could not retrieve flight schedule information.");
                    return null;
                });
        }

    }

    angular.module("app.common")
        .service("FlightStatsService",
            ["Restangular", "ErrorHandlingService", (rest, err) => new FlightStatsService(rest, err)]);
}