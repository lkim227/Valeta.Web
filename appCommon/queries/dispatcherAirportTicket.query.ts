module AppCommon {
    export class DispatcherAirportTicketQuery extends RestClientBase {
        //repository configuration
        apiControllerName = ValetConfiguration_Routing.DispatcherAirportTicketRoute;

        getById(id: string): ng.IPromise<AirportTicketQueryResult> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_CommonMethods.GetByID + "/")
                .customGET(id)
                .then((data: AirportTicketQueryResult) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        getByTicketNumber(ticketNumber: string): ng.IPromise<AirportTicketQueryResult> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/" + ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetByTicketNumber + "/")
                .customGET(ticketNumber)
                .then((data: AirportTicketQueryResult) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        getByVehicleID(vehicleId: string): ng.IPromise<AirportTicketQueryResult[]> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/" + ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetByVehicleID)
                .customGET(vehicleId)
                .then((data: AirportTicketQueryResult[]) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch(() => {
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("DispatcherAirportTicketQuery",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new DispatcherAirportTicketQuery(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}