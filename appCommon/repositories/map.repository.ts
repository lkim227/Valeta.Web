module AppCommon {
    export class MapRepository extends RepositoryBase<MapDTO> {
        apiControllerName = "Map";
        methodNameForFetch = "";
    }

    angular.module("app.common")
        .service("MapRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new MapRepository(restangularService, errorHandlingService)
        ]);
}