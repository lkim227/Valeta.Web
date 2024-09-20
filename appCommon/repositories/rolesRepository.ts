module AppCommon {
    export class RolesRepository extends RepositoryBase<string> {
        apiControllerName = "Roles";
        methodNameForGetAll = "";
        methodNameForCreate = "";
        methodNameForDelete = "";

        updateRole(oldRole: string, updateToRole: string, baseURL: string): ng.IPromise<void> {
            this.restng.setBaseUrl(baseURL);
            var repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/" + oldRole + "/" + updateToRole)
                .customPUT()
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                });
        }
    }

    angular.module("app.common")
        .service("RolesRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new RolesRepository(restangularService, errorHandlingService)
        ]);
}