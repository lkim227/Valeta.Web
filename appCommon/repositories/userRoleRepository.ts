module AppCommon {
    export class UserRoleRepository extends RepositoryBase<UserRoleDTO> {
        apiControllerName = "UserRole";
        methodNameForFetch = "List";
        
        updateUserRoles(userID: string, userRoles: UserRoleDTO[], baseURL: string): ng.IPromise<void> {
            this.restng.setBaseUrl(baseURL);
            var repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/List/" + userID)
                .customPUT(userRoles)
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                });
        }
    }

    angular.module("app.common")
        .service("UserRoleRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new UserRoleRepository(restangularService, errorHandlingService)
        ]);
}