module AppCommon {
    export class BillingRefundDocumentController extends AppCommon.ControllerBase {
        isBillingDocumentGenerated: boolean;
        ticketIdentifier: string;
        transactionID: string;
        billingDocumentUrl: string;
    
        static $inject = ["$stateParams", "AuthService", "BillingDocumentForTicketQuery"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private authService: AppCommon.AuthService,
            private billingDocumentForTicketQuery: AppCommon.BillingDocumentForTicketQuery) {

            super(authService);

            this.isBillingDocumentGenerated = false;

            this.ticketIdentifier = this.$stateParams["ticketIdentifier"];
            this.transactionID = this.$stateParams["transactionId"];

            if (!!this.ticketIdentifier && this.ticketIdentifier.length > 0 &&
                !!this.transactionID && this.transactionID.length > 0) {
                const ordersPromise = this.billingDocumentForTicketQuery.getBillingRefundDocument(this.ticketIdentifier, this.transactionID);
                ordersPromise.then((result) => {
                    if (result) {
                        const urlPromise = this.billingDocumentForTicketQuery.getBillingRefundDocumentUrl(this.ticketIdentifier, this.transactionID);
                        urlPromise.then((resultUrl) => {
                            if (!!resultUrl && resultUrl.length > 0) {
                                var cacheBuster = new Date().getTime();
                                this.billingDocumentUrl = `${AppCommon.AppCommonConfig.billingDocumentUrl}${resultUrl}?${cacheBuster}`;
                                $("#billingRefundDocumentReport").load(`${this.billingDocumentUrl} div`); // only load div elements so head and body elements are not included
                                this.isBillingDocumentGenerated = true;
                            }
                        });
                    }
                });
            }
        }

        printReport = (): void => {
                var frameEstimate = document.createElement('iframe');
                frameEstimate.name = "BillingRefundDocument";
                frameEstimate.style.position = "absolute";
                frameEstimate.style.top = "-1000000px";
                frameEstimate.src = this.billingDocumentUrl;
                document.body.appendChild(frameEstimate);
                setTimeout(function () {
                    window.frames["BillingRefundDocument"].focus();
                    window.frames["BillingRefundDocument"].print();
                    document.body.removeChild(frameEstimate);
                }, 400);
            }

        goBack = (): void => {
            window.history.back();
        }
    }

    angular.module("app.common")
        .controller("BillingRefundDocumentController",
        [
            "$stateParams", "AuthService", "BillingDocumentForTicketQuery",
            (sparams, auth, est) => new BillingRefundDocumentController(sparams, auth, est)
        ]);
}