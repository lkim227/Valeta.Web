module AppStaff {
    export class ServiceTaskEvent extends AppCommon.RestClientBase {
        apiControllerName = ServiceTaskConfiguration_Routing.EventsRoute;
       
        getByID(id: string): ng.IPromise<Array<string>> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_CommonMethods.GetByID)
                .customGET(id)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
    }

    angular.module("app.staff")
        .service("ServiceTaskEvent",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new ServiceTaskEvent(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}