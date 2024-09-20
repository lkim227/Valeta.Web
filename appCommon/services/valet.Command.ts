module AppCommon {
    export class ValetServiceCommand extends RestClientBase {
        getCommandName(commandObject: any): string {
            const dtoCommandName = commandObject.constructor.name.replace("CommandDTO", "");
            return dtoCommandName;
        }

        doCommand(apiControllerName: string, commandObject: any): angular.IPromise<boolean> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(apiControllerName + "/" + this.getCommandName(commandObject))
                .customPOST(commandObject)
                .then(() => {
                    return true; 
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return false;
                });
        }

        removeGreeterFromMultipleZones(apiControllerName: string, removeCommands: Array<RemoveGreeterFromZoneCommandDTO>): angular.IPromise<boolean> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(apiControllerName + "/" + ValetConfiguration_Routing_ValetCommandMethods.RemoveGreeterFromMultipleZones)
                .customPOST(removeCommands)
                .then(() => {
                    return true;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return false;
                });
        }

        moveGreeterFromZoneToZone(apiControllerName: string, moveCommand: MoveGreeterFromZoneToZoneDTO): angular.IPromise<boolean> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(apiControllerName + "/" + ValetConfiguration_Routing_ValetCommandMethods.MoveGreeterFromZoneToZone)
                .customPOST(moveCommand)
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
        .service("ValetServiceCommand",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new ValetServiceCommand(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}