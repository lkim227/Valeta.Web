module AppStaff {
    export class PromotionRepository extends AppCommon.RepositoryBase<PromotionDTO> {
        //repository configuration
        apiControllerName: string = "Promotion";
    }

    angular.module("app.staff").service("PromotionRepository",
        ["Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new PromotionRepository(restangularService, errorHandlingService)]);
}