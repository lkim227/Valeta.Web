module AppCommon {
    export interface IEstimateAttrs extends ng.IAttributes {
        reservationAndBilling: ReservationAndBilling;
    }

    export interface IEstimateScope extends ng.IScope {
        isPaymentMethodAuthorized: boolean;
        isEstimateGenerated: boolean;
        isEstimateFailed: boolean;
        reservationAndBilling: ReservationAndBilling;
        estimateUrl: string;

        printReport(): void;
    }

    class Estimate implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appCommon/directives/customer/estimateReservation/estimate.directive.html";
        scope = {
            reservationAndBilling: "=?",
            isEstimateGenerated: "=?",
            isEstimateFailed: "=?"
        };


        static $inject = ["EstimateForReservationQuery"];

        constructor(private estimateForReservationQuery: EstimateForReservationQuery) {
        }

        static instance(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory = (estService) => new Estimate(estService);
            return directive;
        }

        link: ng.IDirectiveLinkFn = (scope: IEstimateScope, elements: ng.IAugmentedJQuery, attrs: IEstimateAttrs) => {
            scope.isEstimateGenerated = false;
            scope.isEstimateFailed = false;

            scope.$watch("reservationAndBilling",
                () => {
                    if (!!scope.reservationAndBilling && scope.reservationAndBilling.Reservation.ReservationNumber > 0) {
                        const ordersPromise = this.estimateForReservationQuery.generateEstimate(scope.reservationAndBilling);
                        ordersPromise.then((result) => {
                            if (result) {

                                const urlPromise = this.estimateForReservationQuery
                                    .getEstimateUrl(scope.reservationAndBilling.Reservation.ID);
                                urlPromise.then((resultUrl) => {
                                    if (!!resultUrl && resultUrl.length > 0) {
                                        var cacheBuster = new Date().getTime();
                                        scope.estimateUrl = `${AppCommon.AppCommonConfig.billingDocumentUrl}${resultUrl}?${cacheBuster}`;
                                        $("#estimateReport").load(`${scope.estimateUrl} div`); // only load div elements so head and body elements are not included
                                        scope.isEstimateGenerated = result;
                                    }
                                });
                            } else {
                                scope.isEstimateFailed = true;
                            }
                        });
                        scope.isPaymentMethodAuthorized = true;
                    }
                });

            scope.printReport = () => {
                // Not using 'ngPrint' directive because it prints others components of the page
                // TO-DO: create own directive to make this funcionality generic
                var frameEstimate = document.createElement('iframe');
                frameEstimate.name = "Estimate";
                frameEstimate.style.position = "absolute";
                frameEstimate.style.top = "-1000000px";
                frameEstimate.src = scope.estimateUrl;
                document.body.appendChild(frameEstimate);
                setTimeout(function () {
                    window.frames["Estimate"].focus();
                    window.frames["Estimate"].print();
                    document.body.removeChild(frameEstimate);
                }, 400);
            }

        };
    }

    angular.module("app.common")
        .directive("estimate",
        ["EstimateForReservationQuery", (estService) => new Estimate(estService)]);

}