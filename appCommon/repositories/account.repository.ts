module AppCommon {
    export class AccountRepository extends RepositoryBase<AccountDTO> {
        //repository configuration
        apiControllerName = "Account";
        methodNameForFetch = "GetByID";
        methodNameForCreate = "Signup";

        doSignup(dto: SignupNewCustomerDTO): angular.IPromise<boolean> {
            this.apiControllerName = CommonConfiguration_Routing.AccountRoute;
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_AccountMethods.Signup)
                    .customPOST(dto)
                .then(() => {
                    return true;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return false;
                });
        }
    }

    angular.module("app.common")
        .service("AccountRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new AccountRepository(restangularService, errorHandlingService)
        ]);
}