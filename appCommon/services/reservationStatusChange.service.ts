module AppCommon {
    export class ReservationStatusChangeService extends RestClientBase {
        apiControllerName = "ReservationStatusChange";

        static $inject = ["Restangular", "ErrorHandlingService"];

        constructor(restng: restangular.IService,
            errorHandlingService: ErrorHandlingService) {

            super(restng, errorHandlingService);
        }

        changeReservationStatus(reservationID: string, status: ReservationStatus): ng.IPromise<boolean> {

            let route = "";
            switch (status) {
            case ReservationStatus.Pending:
                    route = this.apiControllerName + "/MakePending";
                break;
            case ReservationStatus.Cancelled:
                    route = this.apiControllerName + "/MakeCancelled";
                break;
            case ReservationStatus.Completed:
                //this is done via CloseAirportTicket command
                break;
            }

            return this.restng
                .all(route)
                .post(`'${reservationID}'`)
                .then(() => {
                    return true;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There is a problem with your reservation.  Please try to submit it again.");
                    return false;
                });
        }
    }

    angular.module("app.common")
        .service("ReservationStatusChangeService",
        [
            "Restangular", "ErrorHandlingService",
            (rest, err) => new ReservationStatusChangeService(rest, err)
        ]);
}