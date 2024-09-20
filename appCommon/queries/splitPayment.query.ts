module AppCommon {
    export class SplitPaymentQuery extends RestClientBase {
        //repository configuration
        apiControllerName = CommonConfiguration_Routing.SplitPaymentRoute;

        initialize(billingId: string): ng.IPromise<BillingQueryResult> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customGET(billingId)
                .then((data: BillingQueryResult) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        tryDifferentAllowanceDailyRate(billing: BillingQueryResult, reservation: ReservationDTO): ng.IPromise<BillingQueryResult> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            var reservationAndBilling = new ReservationAndBilling();
            reservationAndBilling.Billing = billing;
            reservationAndBilling.Reservation = reservation;
            return this.restng
                .one(this.apiControllerName)
                .customPOST(reservationAndBilling)
                .then((data: BillingQueryResult) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        cancelSplitPayment(billing: BillingQueryResult, reservation: ReservationDTO): ng.IPromise<BillingQueryResult> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            var reservationAndBilling = new ReservationAndBilling();
            reservationAndBilling.Billing = billing;
            reservationAndBilling.Reservation = reservation;
            return this.restng
                .one(this.apiControllerName + "/cancel")
                .customPOST(reservationAndBilling)
                .then((data: BillingQueryResult) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("SplitPaymentQuery",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new SplitPaymentQuery(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}