module AppCommon {
    export class EventStoreRepository extends RepositoryBase<Object> {
        //repository configuration
        apiControllerName = "EventStore";

        loadEventsWithTypeFor(collection: string, id: string): ng.IPromise<any[]> {
            var repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/LoadEventsWithTypeFor")
                .one(collection)
                .one(id)
                .customPOST()
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch(() => {
                    this.errorHandlingService.showPageError(`Error retreiving ${collection} events.`);
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("EventStoreRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new EventStoreRepository(restangularService, errorHandlingService)
        ]);
}