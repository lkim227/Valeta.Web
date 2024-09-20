module AppCommon {
    export class EstimateForReservationQuery extends AppCommon.RestClientBase {
        apiControllerName = "EstimateForReservation";

        generateEstimate(reservationAndBilling: ReservationAndBilling): ng.IPromise<boolean> {
            return this.restng
                .one(this.apiControllerName + "/GenerateEstimate")
                .customPOST(reservationAndBilling)
                .then((data) => {
                    return true;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason.data, "There is a problem with your reservation request.  Please contact us to complete your reservation.");
                    return false;
                });
        }

        getEstimateUrl(reservationID: string): ng.IPromise<string> {
            return this.restng
                .one(this.apiControllerName + "/GetEstimateUrl")
                .customGET(reservationID)
                .then((data) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason.data, "There is a problem with your reservation request.  Please contact us to complete your reservation.");
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("EstimateForReservationQuery",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new EstimateForReservationQuery(restangularService, errorHandlingService)
        ]);
}