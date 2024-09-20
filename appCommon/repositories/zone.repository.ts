module AppCommon {
    export class ZoneRepository extends RepositoryBase<ZoneDTO> {
        //repository configuration
        apiControllerName = CommonConfiguration_Routing.ZoneRoute;

        findBestAvailableSlot(zoneID: string, vehicleID: string): ng.IPromise<SlotDTO> {

            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_ZoneMethods.FindBestAvailableSlot + "/" + zoneID)
                .customGET(vehicleID)
                .then((data: SlotDTO) => {
                    return data;
                })
                .catch(() => {
                    return null;
                });
        }

        getByOperatingLocationID(operatingLocationID: string): ng.IPromise<ZoneDTO[]> {

            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_ZoneMethods.GetByOperatingLocationID + "/")
                .customGET(operatingLocationID)
                .then((data: ZoneDTO[]) => {
                    return data;
                })
                .catch(() => {
                    return null;
                });
        }

        getByOperatingLocationIDAsMatrix(operatingLocationID: string): ng.IPromise<ZoneDTO[][]> {

            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_ZoneMethods.GetByOperatingLocationIDAsMatrix + "/")
                .customGET(operatingLocationID)
                .then((data: ZoneDTO[][]) => {
                    return data;
                })
                .catch(() => {
                    return null;
                });
        }

        updateFromZoneSpreadsheet(operatingLocationID: string, spreadsheet: ZoneDTO[]): ng.IPromise<boolean> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/UpdateFromZoneSpreadsheet/" + operatingLocationID)
                .customPOST(spreadsheet)
                .then(() => {
                    return true;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return false;
                });
        }

        updateFromZoneLotSpreadsheet(operatingLocationID: string, spreadsheet: ZoneLotSpreadsheetDTO[]): ng.IPromise<boolean> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/UpdateFromZoneLotSpreadsheet/" + operatingLocationID)
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
        .service("ZoneRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new ZoneRepository(restangularService, errorHandlingService)
        ]);
}