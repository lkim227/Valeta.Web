module AppCommon {
    export class OperatingLocationRepository extends RepositoryBase<OperatingLocationDTO> {
        //repository configuration
        apiControllerName = CommonConfiguration_Routing.OperatingLocationRoute;

        create(obj: OperatingLocationDTO): ng.IPromise<boolean> {
            return this.restng
                .one(this.apiControllerName + "/CreateOperatingLocation")
                .customPOST(obj)
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
        .service("OperatingLocationRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new OperatingLocationRepository(restangularService, errorHandlingService)
        ]);
}