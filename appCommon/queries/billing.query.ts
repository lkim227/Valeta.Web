module AppCommon {
    export class BillingQuery extends RestClientBase {
        //repository configuration
        apiControllerName = CommonConfiguration_Routing.BillingRoute;

        getById(id: string): ng.IPromise<BillingQueryResult> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/GetByID/")
                .customGET(id)
                .then((data: BillingQueryResult) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        checkPromotionCode(promotionCode: string, ticketNumber: string): ng.IPromise<CheckPromotionCodeResultDTO> {
            return this.restng
                .one(`${this.apiControllerName}/CheckPromotionCode/${promotionCode}/${ticketNumber}`)
                .customPOST()
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        getReservedPromotionCodes(id: string): ng.IPromise<Array<string>> {
            return this.restng
                .one(`${this.apiControllerName}/GetReservedPromotionCodes/${id}`)
                .customPOST()
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        regenerateBilling(id: string): ng.IPromise<string> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_BillingMethods.RegenerateBilling + "/")
                .customGET(id)
                .then((data: string) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("BillingQuery",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new BillingQuery(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}