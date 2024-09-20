module AppCommon {
    export class RewardRepository extends RepositoryBase<RewardDTO> {
        //repository configuration
        apiControllerName = CommonConfiguration_Routing.RewardRoute;
        methodNameForFetch = CommonConfiguration_Routing_RewardMethods.GetAvailable;
        methodNameForManagementReward = CommonConfiguration_Routing_RewardMethods.GetManagementReward;

        getManagementReward(baseURL: string): ng.IPromise<RewardDTO> {
            this.restng.setBaseUrl(baseURL);
            return this.restng
                .one(this.apiControllerName + "/" + this.methodNameForManagementReward)
                .get()
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("RewardRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new RewardRepository(restangularService, errorHandlingService)
        ]);
}