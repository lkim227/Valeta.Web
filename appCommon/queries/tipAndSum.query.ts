module AppCommon {
    export class TipAndSumQuery extends RestClientBase {
        //repository configuration
        apiControllerName = CommonConfiguration_Routing.ValetTipRoute;

        getListByValetId(valetId: string, filterFromDateTime: string, filterToDateTime: string): ng.IPromise<Array<ValetTipDTO>> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            this.apiControllerName = CommonConfiguration_Routing.ValetTipRoute;
            return this.restng
                .one(this.apiControllerName + "/" + valetId + "/" + CommonConfiguration_Routing_TipMethods.GetForDates + "/" + filterFromDateTime)
                .customGET(filterToDateTime)
                .then((data: Array<ValetTipDTO>) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        getListAll(filterFromDateTime: string, filterToDateTime: string, operatingLocationID: string): ng.IPromise<Array<ValetTipDTO>> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            this.apiControllerName = CommonConfiguration_Routing.TipRoute;
            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_TipMethods.GetForDates + "/" + filterFromDateTime + "/" + filterToDateTime)
                .customGET(operatingLocationID)
                .then((data: Array<ValetTipDTO>) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
        getSumAll(filterFromDateTime: string, filterToDateTime: string, operatingLocationID: string): ng.IPromise<Array<ValetTipDTO>> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            this.apiControllerName = CommonConfiguration_Routing.TipSumRoute;
            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_TipMethods.GetForDates + "/" + filterFromDateTime + "/" + filterToDateTime)
                .customGET(operatingLocationID)
                .then((data: Array<ValetTipDTO>) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("TipAndSumQuery",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new TipAndSumQuery(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}