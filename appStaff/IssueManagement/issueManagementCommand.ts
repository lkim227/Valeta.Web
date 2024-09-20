module AppStaff {
    export class IssueManagementCommand extends AppCommon.RestClientBase {
        apiControllerName = IssueManagementConfiguration_Routing.CommandRoute;

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
                    return true; //success
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return false;
                });
        }
    }

    angular.module("app.staff")
        .service("IssueManagementCommand",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new IssueManagementCommand(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}