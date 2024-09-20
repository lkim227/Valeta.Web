module AppCommon {
    export class CommunicationService extends RestClientBase {
        apiControllerName = "Communication";

        //***************************************** COMMANDS ***********************************************/
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

        //***************************************** QUERIES ***********************************************/

        getSmsByID(id: string): ng.IPromise<SmsMessageDTO> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/GetSmsByID/")
                .customGET(id)
                .then((data: SmsMessageDTO) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        getSmsByReference(context: string, identifier: string): ng.IPromise<Array<SmsMessageDTO>> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/GetSmsByReference/" + context)
                .customGET(identifier)
                .then((data: SmsMessageDTO) => {
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
        .service("CommunicationService",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new CommunicationService(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}