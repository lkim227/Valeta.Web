module AppCommon {
    export class DefinedListRepository extends RepositoryBase<DefinedListDTO> {
        //repository configuration
        apiControllerName = "DefinedList";

        insertDefinedListValue(definedListName: string, attributeToAdd: string): ng.IPromise<boolean> {
            var repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/CreateFromValue")
                .one(definedListName)
                .one(attributeToAdd)
                .customPOST()
                .then(() => {
                    return true; //success
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return false;
                });
        }

        updateFromSpreadsheet(spreadsheet: DefinedListDTO[]): ng.IPromise<boolean> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/UpdateFromSpreadsheet")
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
        .service("DefinedListRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new DefinedListRepository(restangularService, errorHandlingService)
        ]);
}