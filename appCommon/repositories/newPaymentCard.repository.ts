module AppCommon {
    export class NewPaymentCardRepository extends RepositoryBase<NewPaymentCardDTO> {
        //repository configuration
        apiControllerName = "NewPaymentCard";
    }

    angular.module("app.common")
        .service("NewPaymentCardRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new NewPaymentCardRepository(restangularService, errorHandlingService)
        ]);
}