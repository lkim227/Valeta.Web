module AppCommon {
    export class VehicleRepository extends RepositoryBase<VehicleDTO> {
        //repository configuration
        apiControllerName = CommonConfiguration_Routing.VehicleRoute;
        methodNameForFetch = CommonConfiguration_Routing_VehicleMethods.GetByAccountID;

        getByAccountID(accountId: string): ng.IPromise<VehicleDTO[]> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/" + this.methodNameForFetch)
                .customGET(accountId)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch(() => {
                    return null;
                });
        }

        getImagesByTicketAndSide(ticketNumber: number, vehiclePart: string): ng.IPromise<VehicleDamageCheckPhotoDTO[]> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one("VehicleDamageCheck/List")
                .customGET(ticketNumber.toString(), { vehiclePart: vehiclePart })
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch(() => {
                    return null;
                });
        }

        getDamagesByTicket(ticketNumber: number): ng.IPromise<VehicleDamageMarkDTO[]> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one("VehicleDamageMark/List")
                .customGET(ticketNumber.toString())
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch(() => {
                    return null;
                });
        }

        getDamageSignatureByTicket(ticketNumber: number): ng.IPromise<VehicleDamageSignatureDTO> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one("DamageSignature")
                .customGET(ticketNumber.toString())
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch(() => {
                    return null;
                });
        }

    }

    angular.module("app.common")
        .service("VehicleRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new VehicleRepository(restangularService, errorHandlingService)
        ]);
}