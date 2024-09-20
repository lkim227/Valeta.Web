module AppCommon {
    export interface IServiceTaskStatusAttrs extends ng.IAttributes {
    }

    export interface IServiceTaskStatusScope extends ng.IScope {
        directiveInitialized: boolean;
        serviceTaskIdentifier: string;
        hideTitle: boolean;

        service: ServiceTaskQueryResult;

        formMessages: any;
        genericUtils: AppCommon.GenericUtils;
        enumUtils: AppCommon.EnumUtils;
        setCSSClassForStatus(status: number): string;
    }

    class ServiceTaskStatusDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appCommon/directives/ticket/serviceTaskStatus.directive.html";
        scope = {
            serviceTaskIdentifier: "=",
            hideTitle: "="
        };

        static $inject = ["$stateParams", "SessionService", "ErrorHandlingService", "ServiceTaskQuery", "AuthService"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private errorService: AppCommon.ErrorHandlingService,
            private serviceTaskQuery: AppCommon.ServiceTaskQuery,
            private authService: AppCommon.AuthService) {
        }

        link: ng.IDirectiveLinkFn = (scope: IServiceTaskStatusScope, elements: ng.IAugmentedJQuery, attrs: IServiceTaskStatusAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;
            scope.genericUtils = AppCommon.GenericUtils;
            scope.enumUtils = AppCommon.EnumUtils;
            
            scope.setCSSClassForStatus = (status: number): string => {
                var style = "";
                switch (status) {
                    case 0:
                    case 10:
                        style = "alert-danger"; // red
                        break;
                    case 1:
                    case 2:
                        style = "alert-warning"; // yellow
                        break;
                    case 3:
                    case 4:
                    case 11:
                        style = "alert-success"; // green
                        break;
                }

                return style;
            }

            var initializeDirective = () => {
                if (!!scope.serviceTaskIdentifier) {
                    self.serviceTaskQuery.getByID(scope.serviceTaskIdentifier)
                        .then((serviceTaskQueryResult) => {
                            scope.service = serviceTaskQueryResult;
                        });

                    scope.directiveInitialized = true;
                }
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("serviceTaskIdentifier",
                    (newValue) => {
                        if (typeof (newValue) !== "undefined" && !!newValue) {
                            deregisterWait();
                            initializeDirective();
                        }
                    });;
            }
            var waitForDom = () => {
                waitForScopeVariables();
            }
            setTimeout(waitForDom, 0);
        };
    }

    angular.module("app.common")
        .directive("serviceTaskStatus",
        [
            "$stateParams", "SessionService", "ErrorHandlingService", "ServiceTaskQuery", "AuthService",
            (sp, s, err, stq, a) => new ServiceTaskStatusDirective(sp, s, err, stq, a)
        ]);
}