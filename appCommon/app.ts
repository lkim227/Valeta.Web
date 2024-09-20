module AppCommon {
    var appCommon = angular.module("app.common",
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
        "restangular",
        "angulartics", // "angulartics.google.analytics"
        "vcRecaptcha"
        //our custom modules
    ]);

    appCommon.config([
        "$stateProvider", "$urlRouterProvider", "$linkedInProvider",
            ($stateProvider, $urlRouterProvider, $linkedInProvider) => {
            return new AppCommonConfig($stateProvider, $urlRouterProvider, $linkedInProvider);
        }
    ]);

    appCommon.run([
        "$rootScope", "$state", "SessionService", "AuthService",
        ($rootScope: any, $state: ng.ui.IStateService, sessionService: SessionService, authService: AuthService) => {

            $rootScope.$state = $state;
            
            $rootScope.$on("$stateChangeStart",
                function(event, toState, toParams, fromState, fromParams) {

                    const authorizedRoles: string[] = toState.data.authorizedRoles;

                    //console.log(`stateChangeStart from ${fromState.name} to ${toState.name}`);

                    //always reset errorBox
                    const matches = document.querySelectorAll(".form-errorBox, .form-errorBoxAbsolute");
                    for (let i = 0; i < matches.length; i++) {
                        angular.element(matches[i]).remove();
                    }

                    //NOTE: uncomment these lines to see what the error box looks like
                    //const foundElement = document.getElementById("pageErrorArea");
                    //const formattedErrorMessage = "This is a test error!";
                    //const contentToAdd = `<div class='form-errorBoxAbsolute'><span><span class='glyphicon glyphicon-ban-circle'></span>${formattedErrorMessage}</span></div>`;
                    //angular.element(foundElement).after(contentToAdd);

                    // special screens - no auth required
                    if (toState.name === "migrated" || toState.name === "login" || toState.name === "signup" || toState.name === "notauthorized" || toState.name === "logout" || toState.name === "forgotpassword" || toState.name === "reservations-admin") {
                        return;
                    }

                    // set default customer account ui routing so we only have to explicitly set it when employee or agent is acting on behalf of customer
                    if (typeof toState.data.CustomerAccountUiRouting == "undefined") {
                        toState.data.CustomerAccountUiRouting = AppCommonConfig.defaultCustomerAccountUiRouting;
                    }
                    
                    const rightsThatHaveAccess: string[] = toState.data.rightsThatHaveAccess;
                    if (!authService.isAuthorized(authorizedRoles) || !authService.hasAtLeastOneOfTheseRights(rightsThatHaveAccess, AccessLevel.View)) {
                        event.preventDefault();
                        if (authService.isAuthenticated()) {
                            // user is not allowed
                            $state.go("notauthorized");

                        } else {
                            //user is not logged in
                            $state.go("login");
                        }
                    }
                });

            //authService.getSession();
        }
    ]);
}