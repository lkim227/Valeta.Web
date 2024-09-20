module AppCommon {
    export class SystemConfigurationService extends RestClientBase {
        apiControllerName = "SystemConfigurationService";

        static $inject = ["Restangular", "ErrorHandlingService"];

        constructor(restng: restangular.IService,
            errorHandlingService: ErrorHandlingService) {

            super(restng, errorHandlingService);
        }

        getSystemConfigurationValue(valueName: string): ng.IPromise<any> {
            return this.restng
                .one(this.apiControllerName + "/getSystemConfigurationValue")
                .customGET(valueName)
                .then(data => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There was a problem retrieving system configuration for " + valueName);
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("SystemConfigurationService",
        [
            "Restangular", "ErrorHandlingService",
            (rest, err) => new SystemConfigurationService(rest, err)
        ]);
}