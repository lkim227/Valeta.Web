module AppCommon {
    export class LotRepository extends RepositoryBase<LotDTO> {
        //repository configuration
        apiControllerName = CommonConfiguration_Routing.LotRoute;

        getByOperatingLocation(operatingLocationID: string): ng.IPromise<Array<LotDTO>> {
            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_LotMethods.GetByOperatingLocationID)
                .customGET(operatingLocationID)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        getInvalidSlotAttributes(slotAttributesToCheck: string): ng.IPromise<Array<string>> {
            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_LotMethods.GetInvalidSlotAttributes)
                .customPOST(slotAttributesToCheck)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        updateFromSpreadsheet(operatingLocationID: string, spreadsheet: LotSlotSpreadsheetDTO[]): ng.IPromise<boolean> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/" + CommonConfiguration_Routing_LotMethods.UpdateFromSpreadsheet + "/" + operatingLocationID)
                .customPOST(spreadsheet)
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
        .service("LotRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new LotRepository(restangularService, errorHandlingService)
        ]);
}