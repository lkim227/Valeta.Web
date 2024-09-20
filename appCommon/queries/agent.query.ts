module AppCommon {
    export class AgentQuery extends RestClientBase {
        //repository configuration
        apiControllerName = CommonConfiguration_Routing.AgentRoute;

        getByID(id: string): ng.IPromise<AgentQueryResult> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customGET(id)
                .then((data: AgentQueryResult) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        upsert(agentID: string, accountIDs: string[]): ng.IPromise<void> {
            var dto = new AgentDTO();
            dto.ID = agentID;
            dto.AccountIDs = accountIDs;

            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customPOST(dto)
                .then(() => {
                    return;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }


        delete(id: string): ng.IPromise<void> {
            this.restng.setBaseUrl(AppConfig.APIHOST);
            return this.restng
                .one(this.apiControllerName)
                .customDELETE(id)
                .then(() => {
                    return;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("AgentQuery",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new AgentQuery(restangularService, errorHandlingService)
        ]);
}