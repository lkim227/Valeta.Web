module AppCommon {
    export class DemoService extends RestClientBase {
        apiControllerName = "Demo";
        
        clearDemoData(): ng.IPromise<boolean> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customPOST()
                .then(() => {
                    return true;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("DemoService",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new DemoService(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}