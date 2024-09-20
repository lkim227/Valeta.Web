module AppCommon {
    export class NotifyCustomerService extends RestClientBase {
        apiControllerName = "";

        static $inject = ["Restangular", "ErrorHandlingService"];

        constructor(restng: restangular.IService,
            errorHandlingService: ErrorHandlingService) {

            super(restng, errorHandlingService);
        }

        notifyCustomerOfGiveBackZone(ticketID: string): ng.IPromise<boolean> {
            this.apiControllerName = ValetConfiguration_Routing.NotifyCustomerOfGiveBackZoneRoute;
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName +"/" + ticketID)
                .customPOST()
                .then(() => {
                    return true;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return false;
                });
        }

        notifyCustomerOfIntakeZone(ticketID: string): ng.IPromise<boolean> {
            this.apiControllerName = ValetConfiguration_Routing.NotifyCustomerOfIntakeZoneRoute;
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/" + ticketID)
                .customPOST()
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
        .service("NotifyCustomerService",
        [
            "Restangular", "ErrorHandlingService",
            (rest, err) => new NotifyCustomerService(rest, err)
        ]);
}