module AppCommon {
    export class PromotionRepository extends RepositoryBase<PromotionDTO> {
        //repository configuration
        apiControllerName = "Promotion";
    }

    angular.module("app.common")
        .service("PromotionRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new PromotionRepository(restangularService, errorHandlingService)
        ]);
}