module AppStaff {
    export class SagaValetEvents extends AppCommon.RestClientBase {
        apiControllerName = "SagaValetEvents";
       
        getByIDAndDate(id: string, filterFromDateTime: string, filterToDateTime: string): ng.IPromise<Array<string>> {
            this.restng.setBaseUrl(AppConfig.APIHOST);

            var params = new SagaValetEventsParameters();
            params.EmployeeID = id;
            params.FromDateTime = filterFromDateTime;
            params.ToDateTime = filterToDateTime;

            return this.restng
                .one(this.apiControllerName + "/" + id)
                .customPOST(params)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
    }

    angular.module("app.staff")
        .service("SagaValetEvents",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new SagaValetEvents(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}