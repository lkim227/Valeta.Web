module AppCommon {
    export class Omnisearch extends AppCommon.RestClientBase {
        apiControllerName = "Omnisearch";
       
        get(searchTerms: string, getCustomersOnly: boolean): ng.IPromise<Array<OmnisearchQueryResult>> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .get({ terms: searchTerms, getCustomersOnly: getCustomersOnly })
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

    angular.module("app.common")
        .service("Omnisearch",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new Omnisearch(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}