module AppCommon {
    export class ResourceLastKnownLocationForMapRepository extends RepositoryBase<ResourceLastKnownLocationForMapDTO> {
        apiControllerName = "LastKnownLocationForMap";
        methodNameForFetch = "";
    }

    angular.module("app.common")
        .service("ResourceLastKnownLocationForMapRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new ResourceLastKnownLocationForMapRepository(restangularService, errorHandlingService)
        ]);
}