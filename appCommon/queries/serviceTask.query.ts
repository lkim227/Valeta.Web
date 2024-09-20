'use strict';
module AppCommon {
    export class ServiceTaskQuery extends RestClientBase {
        apiControllerName = "";

        getByID(id: string): ng.IPromise<ServiceTaskQueryResult> {
            this.apiControllerName = ServiceTaskConfiguration_Routing.QueryRoute;

            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_CommonMethods.GetByID)
                .customGET(id)
                .then((data: ServiceTaskQueryResult) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        getSummaryByTicketNumber(ticketNumber: number): ng.IPromise<ServiceTaskSummary> {
            this.apiControllerName = ServiceTaskConfiguration_Routing.SummaryRoute;

            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customGET(ticketNumber.toString())
                .then((data: ServiceTaskSummary) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("ServiceTaskQuery",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) =>
                new ServiceTaskQuery(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}