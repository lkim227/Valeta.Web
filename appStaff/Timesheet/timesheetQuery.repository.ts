module AppStaff {
    export class TimesheetQueryRepository extends AppCommon.RestClientBase {
        apiControllerName = "Timesheet";

        getByEmployeeIDCurrentShift(employeeID: string): ng.IPromise<TimesheetQueryResult> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/GetByEmployeeIDCurrentShift/")
                .customGET(employeeID)
                .then((data: TimesheetQueryResult) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        getSummaryByDates(startDate: number, endDate: number): ng.IPromise<Array<TimesheetQueryResult>> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/GetSummaryBetweenDates")
                .customGET("?fromDate=" + startDate + "&toDate=" + endDate) // params
                .then((data: Array<TimesheetQueryResult>) => {
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
        .service("TimesheetQueryRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new TimesheetQueryRepository(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}