module AppCommon {
    export interface ISplitPaymentReservedServicesAttrs extends ng.IAttributes {
    }

    export interface ISplitPaymentReservedServicesScope extends ng.IScope {
        directiveInitialized: boolean;
        analyticsEventName: string;
        reservedServices: ReservedServiceDTO[];
        otherOrderReservedServices: ReservedServiceDTO[];

        initialCountOfReservedServices: number;
        
        getData(): void;
        moveToAnotherOrder(serviceObject, index): void;
    }

    class SplitPaymentReservedServicesDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.splitPaymentReservedServicesListTemplateUrl;

        scope = {
            analyticsEventName: "@",
            reservedServices: "=?",
            otherOrderReservedServices: "=?"
        };

        static $inject = ["SessionService"];

        constructor(private sessionService: AppCommon.SessionService) {
        }

        link: ng.IDirectiveLinkFn = (scope: ISplitPaymentReservedServicesScope, elements: ng.IAugmentedJQuery, attrs: ISplitPaymentReservedServicesAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;

            scope.moveToAnotherOrder = (serviceObject, index: number) => {
                //add to the other order
                if (scope.otherOrderReservedServices === null || typeof scope.otherOrderReservedServices === "undefined") {
                    scope.otherOrderReservedServices = [];
                }
                scope.otherOrderReservedServices.push(serviceObject);

                //remove from ReservedServices of this order
                scope.reservedServices.splice(index, 1);
            };

            var initializeDirective = (reservedServices: any) => {
                //init values
                scope.reservedServices = reservedServices;

                scope.directiveInitialized = true;
            }
            var waitForScopeVariables = () => {
                scope.$watch("reservedServices",
                    (newValue) => {
                        if (typeof (newValue) !== "undefined") {
                            initializeDirective(newValue);
                        }
                    });
            }
            var waitForDom = () => {
                waitForScopeVariables();
            }
            setTimeout(waitForDom, 0);
        };
    }

    angular.module("app.common")
        .directive("splitPaymentReservedServices",
        [
            "SessionService",
            (sessionService) => new SplitPaymentReservedServicesDirective(sessionService)
        ]);
}