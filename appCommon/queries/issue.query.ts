'use strict';
module AppCommon {
    export class IssueQuery extends RestClientBase {
        // repository configuration
        apiControllerName = "IssueManagementQueries";

        getByID(id: string): ng.IPromise<IssueQueryResult> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/GetByID/")
                .customGET(id)
                .then((data: IssueQueryResult) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("IssueQuery",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) =>
                new IssueQuery(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}