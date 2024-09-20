module AppCustomer {
    var appCustomer = angular.module("app.customer",
    [//external module dependencies
        "ui.router",
        "ngAnimate",
        "ngMessages",
        "ui.select",
        "ui.bootstrap",
        "ngSanitize",
        "angular-confirm",
        "ngMask",
        "ngLinkedIn",
        "angular-timeline",
        "ngImgCrop",
        "cgBusy",
        "gavruk.card",
        "restangular",
        "angulartics", //"angulartics.google.analytics",
        "multiStepForm",
        "kendo.directives",

        //our custom modules
        "app.common"
    ]);

    appCustomer.config([
        "$stateProvider", "$urlRouterProvider", "$httpProvider",
        ($stateProvider, $urlRouterProvider, $httpProvider) => {
            return new AppCustomerConfig($stateProvider, $urlRouterProvider, $httpProvider);
        }
    ]);

    appCustomer.run([
        "$rootScope", "$state", "SessionService", "AuthService",
        ($rootScope: any, $state: ng.ui.IStateService, sessionService: AppCommon.SessionService, authService: AppCommon.AuthService) => {

            $rootScope.$state = $state;

            $rootScope.$on("$stateChangeStart",
                function(event, toState, toParams, fromState, fromParams) {

                    //always reset errorBox
                    const matches = document.querySelectorAll(".form-errorBox, .form-errorBoxAbsolute");
                    for (let i = 0; i < matches.length; i++) {
                        angular.element(matches[i]).remove();
                    }

                    if (toState.name === "login" || toState.name === "signup" || toState.name === "notauthorized" || toState.name === "logout" || toState.name === "reservations-admin") {
                        return;
                    }

                    // Leaving agent session so need to reset customerAccountID to userID of agent
                    if (AppCommon.IESafeUtils.stringStartsWith(fromState.name, AppCustomerConfig.agentSessionUiRoutePrefix) &&
                        !AppCommon.IESafeUtils.stringStartsWith(toState.name, AppCustomerConfig.agentSessionUiRoutePrefix)) {
                        sessionService.userInfo.customerAccountID = sessionService.userInfo.userID;
                    }
                    
                    const authorizedRoles = toState.data.authorizedRoles;
                    if (!authService.isAuthorized(authorizedRoles)) {
                        event.preventDefault();
                        if (authService.isAuthenticated()) {
                            // user is not allowed
                            //$scope.$broadcast(AUTH_EVENTS.notAuthorizedRoute);
                            $state.go("notauthorized");

                        } else {
                            // user is not logged in
                            //                            if (!!$window.sessionStorage) {
                            //                                $window.sessionStorage
                            //                                    .setItem("navigateAfterLogin",
                            //                                        JSON.stringify({ state: toState.name, params: toParams }));
                            //                            }
                            //                            $scope.$broadcast(AUTH_EVENTS.notAuthenticated);

                            $state.go("login");

                        }
                    }
                });

            authService.getSession();
        }
    ]);
}