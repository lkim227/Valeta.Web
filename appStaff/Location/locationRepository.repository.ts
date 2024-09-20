module AppStaff {
    export class LocationRepository extends AppCommon.RepositoryBase<TemplateDTO> {
        apiControllerName = "Location";
        
    }

    angular.module("app.staff")
        .service("LocationRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new LocationRepository(restangularService, errorHandlingService)
        ]);
}