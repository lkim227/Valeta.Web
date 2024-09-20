module AppCommon {
    export class EmployeeRepository extends RepositoryBase<EmployeeDTO> {
        //repository configuration
        apiControllerName = CommonConfiguration_Routing.EmployeeRoute;
        methodNameForCreate = "CreateAndQuery";
    }

    angular.module("app.common")
        .service("EmployeeRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new EmployeeRepository(restangularService, errorHandlingService)
        ]);
}