module AppStaff {
    export class TemplateContentWithTemplateRepository extends AppCommon.RepositoryBase<TemplateContentWithTemplateDTO> {
        apiControllerName = "TemplateContentWithTemplate";
        
    }

    angular.module("app.staff")
        .service("TemplateContentWithTemplateRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new TemplateContentWithTemplateRepository(restangularService, errorHandlingService)
        ]);
}