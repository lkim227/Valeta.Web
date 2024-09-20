module AppCommon {
    export class BillingOriginalDocumentController extends AppCommon.ControllerBase {
        isBillingDocumentGenerated: boolean;
        documentIdentifier: string;
        billingDocumentUrl: string;
    
        static $inject = ["$stateParams", "AuthService", "BillingDocumentForTicketQuery"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private authService: AppCommon.AuthService,
            private billingDocumentForTicketQuery: AppCommon.BillingDocumentForTicketQuery) {

            super(authService);

            this.isBillingDocumentGenerated = false;

            this.documentIdentifier = this.$stateParams["documentIdentifier"];

            if (!!this.documentIdentifier && this.documentIdentifier.length > 0) {
                const ordersPromise = this.billingDocumentForTicketQuery.getBillingOriginalDocument(this.documentIdentifier);
                ordersPromise.then((result) => {
                    if (result) {
                        const urlPromise = this.billingDocumentForTicketQuery.getBillingOriginalDocumentUrl(this.documentIdentifier);
                        urlPromise.then((resultUrl) => {
                            if (!!resultUrl && resultUrl.length > 0) {
                                var cacheBuster = new Date().getTime();
                                this.billingDocumentUrl = `${AppCommon.AppCommonConfig.billingDocumentUrl}${resultUrl}?${cacheBuster}`;
                                $("#billingOriginalDocumentReport").load(`${this.billingDocumentUrl} div`); // only load div elements so head and body elements are not included
                                this.isBillingDocumentGenerated = true;
                            }
                        });
                    }
                });
            }
        }

        printReport = (): void => {
                var frameEstimate = document.createElement('iframe');
                frameEstimate.name = "BillingOriginalDocument";
                frameEstimate.style.position = "absolute";
                frameEstimate.style.top = "-1000000px";
                frameEstimate.src = this.billingDocumentUrl;
                document.body.appendChild(frameEstimate);
                setTimeout(function () {
                    window.frames["BillingOriginalDocument"].focus();
                    window.frames["BillingOriginalDocument"].print();
                    document.body.removeChild(frameEstimate);
                }, 400);
            }

        goBack = (): void => {
            window.history.back();
        }
    }

    angular.module("app.common")
        .controller("BillingOriginalDocumentController",
        [
            "$stateParams", "AuthService", "BillingDocumentForTicketQuery",
            (sparams, auth, est) => new BillingOriginalDocumentController(sparams, auth, est)
        ]);
}