module AppCommon {
    export class EntranceRepository extends RepositoryBase<EntranceDTO> {
        //repository configuration
        apiControllerName = CommonConfiguration_Routing.EntranceRoute;

        getByOperatingLocationID(operatingLocationID: string): ng.IPromise<EntranceDTO[]> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/GetByOperatingLocationID/")
                .customGET(operatingLocationID)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch(() => {
                    return null;
                });
        }

        updateFromEntranceSpreadsheet(operatingLocationID: string, spreadsheet: EntranceDTO[]): ng.IPromise<boolean> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/UpdateFromEntranceSpreadsheet/" + operatingLocationID)
                .customPOST(spreadsheet)
                .then(() => {
                    return true;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return false;
                });
        }

        getSpreadsheetByOperatingLocationID(operatingLocationID: string): ng.IPromise<EntranceMeetLocationZoneSpreadsheetDTO[]> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/GetSpreadsheetByOperatingLocationID/")
                .customGET(operatingLocationID)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch(() => {
                    return null;
                });
        }

        updateFromOperatingLocationSpreadsheet(operatingLocationID: string, spreadsheet: EntranceMeetLocationZoneSpreadsheetDTO[]): ng.IPromise<boolean> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/UpdateFromOperatingLocationSpreadsheet/" + operatingLocationID)
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
        .service("EntranceRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new EntranceRepository(restangularService, errorHandlingService)
        ]);
}