module AppStaff {
    export class BillingEvent extends AppCommon.RestClientBase {
        apiControllerName = "BillingEvents";
       
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
        .service("BillingEvent",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new BillingEvent(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}