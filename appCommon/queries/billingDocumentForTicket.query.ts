module AppCommon {
    export class BillingDocumentForTicketQuery extends RepositoryBase<FlattenedEstimateDTO> {
        //repository configuration
        apiControllerName = "";

        getBillingCostBreakdown(ticketID: string, isCatchAllOrder: boolean): ng.IPromise<OrderDTO> {
            this.apiControllerName = CommonConfiguration_Routing.BillingDocumentForTicketRoute;
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/" + CommonConfiguration_Routing_BillingDocumentForTicketMethods.GetBillingCostBreakdown + "/" + ticketID)
                .customGET(isCatchAllOrder.toString())
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    return null;
                });
        }

        getBillingDocument(ticketID: string): ng.IPromise<Array<FlattenedEstimateDTO>> {
            this.apiControllerName = CommonConfiguration_Routing.BillingDocumentForTicketRoute;
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/GetBillingDocument")
                .customGET(ticketID)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    return null;
                });
        }
        getBillingDocumentUrl(ticketID: string): ng.IPromise<string> {
            this.apiControllerName = CommonConfiguration_Routing.BillingDocumentForTicketRoute;
            return this.restng
                .one(this.apiControllerName + "/GetBillingDocumentUrl")
                .customGET(ticketID)
                .then((data) => {
                    //var finalResult = this.restng.stripRestangular(data);
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There is a problem with your reservation request.  Please contact us to complete your reservation.");
                    return null;
                });
        }

        getEstimate(ticketID: string): ng.IPromise<Array<FlattenedEstimateDTO>> {
            this.apiControllerName = "EstimateForTicket";
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/GetEstimate")
                .customGET(ticketID)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    return null;
                });
        }

        getEstimateUrl(ticketID: string): ng.IPromise<string> {
            this.apiControllerName = "EstimateForTicket";
            return this.restng
                .one(this.apiControllerName + "/GetEstimateUrl")
                .customGET(ticketID)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There is a problem with your reservation request.  Please contact us to complete your reservation.");
                    return null;
                });
        }

        getBillingTotalSummary(id: string, ticketStatus: TicketStatus): ng.IPromise<BillingTotalSummaryDTO> {
            this.apiControllerName = CommonConfiguration_Routing.BillingDocumentForTicketRoute;
            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_BillingDocumentForTicketMethods.GetBillingTotalSummary + "/" + id)
                .customGET(ticketStatus.toString())
                .then((data) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        getOriginalBillingTotalSummary(ticketNumber: string): ng.IPromise<BillingTotalSummaryDTO> {
            this.apiControllerName = CommonConfiguration_Routing.BillingDocumentForTicketRoute;
            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_BillingDocumentForTicketMethods.GetOriginalBillingTotalSummary)
                .customGET(ticketNumber)
                .then((data) => {
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        }

        sendSavedEstimate(id: string): ng.IPromise<boolean> {
            this.apiControllerName = CommonConfiguration_Routing.EstimateForTicketRoute;
            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_EstimateForTicketMethods.SendSavedEstimate)
                .customGET(id)
                .then((data) => {
                    return true;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return false;
                });
        }

        getBillingRefundDocument(ticketID: string, transactionID: string): ng.IPromise<Array<FlattenedEstimateDTO>> {
            this.apiControllerName = CommonConfiguration_Routing.RefundReceiptRoute;
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/" + CommonConfiguration_Routing_ReceiptMethods.GetReceipt + "/" + ticketID)
                .customGET(transactionID)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    return null;
                });
        }
        getBillingRefundDocumentUrl(ticketID: string, transactionID: string): ng.IPromise<string> {
            this.apiControllerName = CommonConfiguration_Routing.RefundReceiptRoute;
            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_ReceiptMethods.GetReceiptUrl + "/" + ticketID)
                .customGET(transactionID)
                .then((data) => {
                    //var finalResult = this.restng.stripRestangular(data);
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There is a problem with your reservation request.  Please contact us to complete your reservation.");
                    return null;
                });
        }

        getBillingOriginalDocument(documentID: string): ng.IPromise<Array<FlattenedEstimateDTO>> {
            this.apiControllerName = CommonConfiguration_Routing.BillingDocumentForTicketRoute;
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/" + CommonConfiguration_Routing_BillingDocumentForTicketMethods.GetOriginal)
                .customGET(documentID)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    return null;
                });
        }
        getBillingOriginalDocumentUrl(documentID: string): ng.IPromise<string> {
            this.apiControllerName = CommonConfiguration_Routing.BillingDocumentForTicketRoute;
            return this.restng
                .one(this.apiControllerName + "/" + CommonConfiguration_Routing_BillingDocumentForTicketMethods.GetOriginalUrl)
                .customGET(documentID)
                .then((data) => {
                    //var finalResult = this.restng.stripRestangular(data);
                    return data;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There is a problem with your request.  Please contact us to complete your reservation.");
                    return null;
                });
        }
    }

    angular.module("app.common")
        .service("BillingDocumentForTicketQuery",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new BillingDocumentForTicketQuery(restangularService, errorHandlingService)
        ]);
}