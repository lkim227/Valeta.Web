module AppStaff {
    export class RefundService extends AppCommon.RestClientBase {
        apiControllerName = CommonConfiguration_Routing.RefundRoute;

        checkAmount(dto: ProcessRefundsDTO): ng.IPromise<string> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/CheckAmount")
                .customPOST(dto)
                .then((data) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        processRefund(dto: ProcessRefundsDTO): ng.IPromise<string> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customPOST(dto)
                .then((data) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
    }

    angular.module("app.staff")
        .service("RefundService",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new RefundService(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}