module AppCommon {
    export class ReceiptQuery extends RepositoryBase<FlattenedEstimateDTO> {
        //repository configuration
        apiControllerName = "Receipt";

        getReceipt(ticketID: string): ng.IPromise<Array<FlattenedEstimateDTO>> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/GetReceipt")
                .customGET(ticketID)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    return null;
                });
        }

        sendSavedReceipt(ticketID: string): ng.IPromise<any> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/SendSavedReceipt/")
                .customGET(ticketID)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    return false;
                });
        }

        getReceiptUrl(ticketID: string): ng.IPromise<string> {
            return this.restng
                .one(this.apiControllerName + "/GetReceiptUrl")
                .customGET(ticketID)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There is a problem with your reservation request.  Please contact us to complete your reservation.");
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("ReceiptQuery",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new ReceiptQuery(restangularService, errorHandlingService)
        ]);
}