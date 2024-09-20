module AppStaff {
    export class TemplateRepository extends AppCommon.RepositoryBase<TemplateDTO> {
        apiControllerName = "Template";
        methodNameForFetch = "GetByGroup";

        getByGroup(group: string): ng.IPromise<TemplateDTO[]> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/GetTemplateWithoutContentByGroup")
                .customGET(group)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch(() => {
                    return null;
                });
        }
    }

    angular.module("app.staff")
        .service("TemplateRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new TemplateRepository(restangularService, errorHandlingService)
        ]);
}