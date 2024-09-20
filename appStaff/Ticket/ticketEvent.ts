module AppStaff {
    export class TicketEvent extends AppCommon.RestClientBase {
        apiControllerName = "TicketEvents";
       
        getByID(id: string): ng.IPromise<Array<string>> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
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
        .service("TicketEvent",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new TicketEvent(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}