module AppCommon {
    export class BillingCommand extends RestClientBase {
        apiControllerName = CommonConfiguration_Routing.BillingCommandRoute;

        getCommandName(commandObject: any): string {
            const dtoCommandName = commandObject.constructor.name.replace("CommandDTO", "");
            return dtoCommandName;
        }

        doCommand(commandObject: any): angular.IPromise<boolean> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/" + this.getCommandName(commandObject))
                .customPOST(commandObject)
                .then(() => {
                    return true; 
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return false;
                });
        }
    }

    angular.module("app.common")
        .service("BillingCommand",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new BillingCommand(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}