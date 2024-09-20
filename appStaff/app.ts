module AppStaff {
    var staffApp = angular.module("app.staff",
    [//external module dependencies
        "ui.router",
        "ngAnimate",
        "ngMessages",
        "ui.select",
        "ui.bootstrap",
        "ngSanitize",
        "angular-confirm",
        "ngMask",
        "angular-timeline",
        "ngImgCrop",
        "cgBusy",
        "gavruk.card",
        "restangular",
        "kendo.directives",
        "multiStepForm",
        "SignalR",

        //our custom modules
        "app.common"
    ]);

    staffApp.config([
        "$stateProvider", "$urlRouterProvider", "$httpProvider",
        ($stateProvider, $urlRouterProvider, $httpProvider) => {
            return new AppStaffConfig($stateProvider, $urlRouterProvider, $httpProvider);
        }
    ]);

    staffApp.run([
        "$rootScope", "$state", "SessionService", "AuthService",
        ($rootScope: any, $state: ng.ui.IStateService, sessionService: AppCommon.SessionService, authService: AppCommon.AuthService) => {

            $rootScope.$state = $state;

            //$rootScope.$on("$stateChangeStart",
            //    function(event, toState, toParams, fromState, fromParams) {

            //        if (toState.name === "login" || toState.name === "signup" || toState.name === "notauthorized" || toState.name === "logout") {
            //            return;
            //        }

            //        const matches = document.querySelectorAll(".form-errorBox");
            //        for (let i = 0; i < matches.length; i++) {
            //            angular.element(matches[i]).remove();
            //        }


            //        const authorizedRoles = toState.data.authorizedRoles;
            //        if (!authService.isAuthorized(authorizedRoles)) {
            //            event.preventDefault();
            //            if (authService.isAuthenticated()) {
            //                // user is not allowed
            //                //$scope.$broadcast(AUTH_EVENTS.notAuthorizedRoute);
            //                $state.go("notauthorized");

            //            } else {
            //                // user is not logged in
            //                //                            if (!!$window.sessionStorage) {
            //                //                                $window.sessionStorage
            //                //                                    .setItem("navigateAfterLogin",
            //                //                                        JSON.stringify({ state: toState.name, params: toParams }));
            //                //                            }
            //                //                            $scope.$broadcast(AUTH_EVENTS.notAuthenticated);

            //                $state.go("login");

            //            }
            //        }
            //    });

            authService.getSession();
        }
    ]);
}