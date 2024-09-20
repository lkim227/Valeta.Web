module AppCommon {
    export class ReportQuery extends RestClientBase {
        apiControllerName = "";

        getAllCountsData(dispatchParameters: DispatchParameters): ng.IPromise<Array<StringAndNumberDTO>> {
            this.apiControllerName = CommonConfiguration_Routing_ReportRoutes.AllCounts;
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customPOST(dispatchParameters)
                .then((data: Array<StringAndNumberDTO>) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        getRevenueSummary(dispatchParameters: DispatchParameters): ng.IPromise<Array<StringAndNumberDTO>> {
            this.apiControllerName = CommonConfiguration_Routing_ReportRoutes.RevenueSummary;
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customPOST(dispatchParameters)
                .then((data: Array<StringAndNumberDTO>) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
        getRevenueDetails(dispatchParameters: DispatchParameters): ng.IPromise<Array<BillingDocumentQueryResult>> {
            this.apiControllerName = CommonConfiguration_Routing_ReportRoutes.RevenueSummary;
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/detail")
                .customPOST(dispatchParameters)
                .then((data: Array<BillingDocumentQueryResult>) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
        getEstimatedRevenueSummary(dispatchParameters: DispatchParameters): ng.IPromise<Array<StringAndNumberDTO>> {
            this.apiControllerName = CommonConfiguration_Routing_ReportRoutes.EstimatedRevenueSummary;
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customPOST(dispatchParameters)
                .then((data: Array<StringAndNumberDTO>) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
        getEstimatedRevenueDetails(dispatchParameters: DispatchParameters): ng.IPromise<Array<BillingDocumentQueryResult>> {
            this.apiControllerName = CommonConfiguration_Routing_ReportRoutes.EstimatedRevenueSummary;
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/detail")
                .customPOST(dispatchParameters)
                .then((data: Array<BillingDocumentQueryResult>) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        getEstimatedRevenueSummaryToInfinity(dispatchParameters: DispatchParameters): ng.IPromise<Array<StringAndNumberDTO>> {
            this.apiControllerName = CommonConfiguration_Routing_ReportRoutes.EstimatedRevenueSummaryToInfinity;
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customPOST(dispatchParameters)
                .then((data: Array<StringAndNumberDTO>) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        getRevenueByServiceCategory(dispatchParameters: DispatchParameters): ng.IPromise<Array<StringAndTwoNumbersDTO>> {
            this.apiControllerName = CommonConfiguration_Routing_ReportRoutes.RevenueByServiceCategory;
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customPOST(dispatchParameters)
                .then((data: Array<StringAndTwoNumbersDTO>) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        getRefundsByCategory(dispatchParameters: DispatchParameters): ng.IPromise<Array<StringAndTwoNumbersDTO>> {
            this.apiControllerName = CommonConfiguration_Routing_ReportRoutes.RefundsByCategory;
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customPOST(dispatchParameters)
                .then((data: Array<StringAndTwoNumbersDTO>) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        getParkedPerDayData(dispatchParameters: DispatchParameters): ng.IPromise<Array<StringAndNumberDTO>> {
            this.apiControllerName = CommonConfiguration_Routing_ReportRoutes.ParkedPerDay;
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customPOST(dispatchParameters)
                .then((data: Array<StringAndNumberDTO>) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("ReportQuery",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new ReportQuery(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}