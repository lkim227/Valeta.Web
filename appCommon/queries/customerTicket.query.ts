module AppCommon {
    export class CustomerTicketQuery extends RestClientBase {
        //repository configuration
        apiControllerName = ValetConfiguration_Routing.CustomerTicketRoute;

        get(customerID: string, ticketID: string): ng.IPromise<CustomerTicketDTO> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName + "/" + customerID + "/")
                .customGET(ticketID)
                .then((data: AirportTicketQueryResult) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("CustomerTicketQuery",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new CustomerTicketQuery(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}