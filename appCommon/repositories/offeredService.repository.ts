module AppCommon {
    export class OfferedServiceRepository extends RepositoryBase<OfferedServiceDTO> {
        //repository configuration
        apiControllerName = CommonConfiguration_Routing.OfferedServiceRoute;

        getAvailableOfferedServices(parkingDays: number, vehicleMake: string): ng.IPromise<Array<OfferedServiceDTO>> {
            return this.restng
                .one(this.apiControllerName +
                    "/" +
                    CommonConfiguration_Routing_OfferedServiceMethods.GetServicesAvailableInTimeframe)
                .one(vehicleMake)
                .one(parkingDays.toString())
                .getList()
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return new Array<OfferedServiceDTO>();
                });
        }

        getAvailableOfferedServicesForCustomer(parkingDays: number, vehicleMake: string): ng.IPromise<Array<OfferedServiceDTO>> {
            return this.restng
                .one(this.apiControllerName +
                    "/" +
                    CommonConfiguration_Routing_OfferedServiceMethods.GetServicesAvailableInTimeframeForCustomer)
                .one(vehicleMake)
                .one(parkingDays.toString())
                .getList()
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return new Array<OfferedServiceDTO>();
                });
        }
    }

    angular.module("app.common")
        .service("OfferedServiceRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new OfferedServiceRepository(restangularService, errorHandlingService)
        ]);
}