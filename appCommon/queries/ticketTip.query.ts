module AppCommon {
    export class TicketTipQuery extends RestClientBase {
        //repository configuration
        apiControllerName = CommonConfiguration_Routing.TicketTipRoute;

        getByTicketId(ticketId: string): ng.IPromise<Array<TipDTO>> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customGET(ticketId)
                .then((data: Array<TipDTO>) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("TicketTipQuery",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new TicketTipQuery(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}