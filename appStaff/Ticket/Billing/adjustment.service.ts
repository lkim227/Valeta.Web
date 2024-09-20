module AppStaff {
    export class AdjustmentService extends AppCommon.RestClientBase {
        apiControllerName = CommonConfiguration_Routing.AdjustmentRoute;
       
        addAdjustments(refund: AdjustmentsForBothOrdersDTO): ng.IPromise<Array<string>> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customPOST(refund)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        deleteAdjustment(command: DeleteAdjustmentCommandDTO): ng.IPromise<boolean> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/delete")
                .customPOST(command)
                .then(() => {
                    return true; 
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return false;
                });
        }
    }

    angular.module("app.staff")
        .service("AdjustmentService",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new AdjustmentService(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}