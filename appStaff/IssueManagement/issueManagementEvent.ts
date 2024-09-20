module AppStaff {
    export class IssueManagementEvent extends AppCommon.RestClientBase {
        apiControllerName = "IssueEvents";
       
        getByID(id: string): ng.IPromise<Array<string>> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/GetByID/")
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
        .service("IssueManagementEvent",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new IssueManagementEvent(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}