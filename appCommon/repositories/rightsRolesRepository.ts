module AppCommon {
    export class RightsRolesRepository extends RepositoryBase<RightsRolesDTO> {
        apiControllerName = "RightsRoles";
        methodNameForFetch = "";
    }

    angular.module("app.common")
        .service("RightsRolesRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new RightsRolesRepository(restangularService, errorHandlingService)
        ]);
}