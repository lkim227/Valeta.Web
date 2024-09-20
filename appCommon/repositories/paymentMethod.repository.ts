module AppCommon {
    export class PaymentMethodRepository extends RepositoryBase<PaymentMethodDTO> {
        //repository configuration
        apiControllerName = CommonConfiguration_Routing.PaymentMethodRoute;
        methodNameForFetch = CommonConfiguration_Routing_PaymentMethodMethods.GetByAccountID;

        authorizePaymentMethod(paymentMethodID: string): ng.IPromise<PaymentMethodAuthorizationResponseDTO> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/AuthorizePaymentMethod")
                .customGET(paymentMethodID)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There is a problem with authorizing selected payment method.");
                    return null;
                });
        }

        getFirstPaymentMethodIDByAccountID(paymentMethodID: string, isCompanyCard: boolean): ng.IPromise<string> {
            const repositoryObject: any = this;

            return this.restng
                .one(repositoryObject.apiControllerName + "/GetFirstPaymentMethodIDByAccountID/" + paymentMethodID)
                .customGET(isCompanyCard.toString())
                .then((data) => {
                    if (typeof data === "string" || data instanceof String) {
                        return data;
                    }

                    var finalResult = this.restng.stripRestangular(data);
                    if (typeof finalResult === "string" || finalResult instanceof String) {
                        return finalResult;
                    }
                    return null;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There is a problem with the payment method.");
                    return null;
                });
        }

        updatePayment(paymentMethod: UpdatedPaymentCardDTO): ng.IPromise<void> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/" +  CommonConfiguration_Routing_PaymentMethodMethods.UpdatePayment)
                .customPOST(paymentMethod)
                .then(() => {
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There is a problem with the selected payment method.");
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("PaymentMethodRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new PaymentMethodRepository(restangularService, errorHandlingService)
        ]);
}