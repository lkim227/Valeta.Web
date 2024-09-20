module AppCommon {
    export class ReservationRepository extends RepositoryBase<ReservationDTO> {
        //repository configuration
        apiControllerName = CommonConfiguration_Routing.ReservationRoute;
        methodNameForFetchAll = "GetAll";
        methodNameForFetch = "GetByAccountID";
        methodNameForCreate = "Create";
        methodNameForDelete = "Delete";

        createReservationAndBilling(dto: ReservationAndBilling): ng.IPromise<boolean> {
            this.restng.setBaseUrl(AppConfig.APIHOST);

            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_ReservationMethods.CreateReservationAndBilling)
                .customPOST(dto)
                .then(() => {
                    return true; //success
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return false;
                });     
        }
        updateReservationAndBilling(dto: ReservationAndBilling): ng.IPromise<boolean> {
            this.restng.setBaseUrl(AppConfig.APIHOST);

            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_ReservationMethods.UpdateReservationAndBilling)
                .customPOST(dto)
                .then(() => {
                    return true; //success
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return false;
                });
        }
        authorizeAndUpdateReservationAndBilling(dto: ReservationAndBilling): ng.IPromise<string> {
            this.restng.setBaseUrl(AppConfig.APIHOST);

            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_ReservationMethods.AuthorizeAndUpdateReservationAndBilling)
                .customPOST(dto)
                .then((data) => {
                    return data; 
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return "Error";
                });
        }
        getParkingDays(departureDate: string, returnDate: string, operatingLocationID: string): ng.IPromise<number> {
            const params = {
                departureDate: departureDate,
                returnDate: returnDate,
                operatingLocationID: operatingLocationID
            };

            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_ReservationMethods.GetParkingDays)
                .customPOST(params)
                .then((data) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return 0;
                });
        }
    }

    angular.module("app.common")
        .service("ReservationRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new ReservationRepository(restangularService, errorHandlingService)
        ]);
}