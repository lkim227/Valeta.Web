module AppStaff {
    export class ConfigureRoutesForDispatchContext {

        static keysAndSlotsTemplateUrl = "Dispatch/keysAndSlots.directive.html";
        static closedTemplateUrl = "Dispatch/closed.directive.html";
        static notClosedTemplateUrl = "Dispatch/notClosed.directive.html";
        static cancelledTemplateUrl = "Dispatch/cancelled.directive.html";

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state("valet-placement",
            {
                url: "/valet-placement",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/Dispatch/valetPlacement.html"
                    }
                },
                data: {
                    PageTitle: "Valet Placement",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.dispatch]
                }
            });
            this.$stateProvider.state("timeline-view",
            {
                url: "/timeline-view",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/Dispatch/timelineView.html"
                    }
                },
                data: {
                    PageTitle: "Current Tickets",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.dispatch]
                }
                });
            this.$stateProvider.state("timeline-captured",
                {
                    url: "/timeline-captured",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/Dispatch/timelineCaptured.html"
                        }
                    },
                    data: {
                        PageTitle: "Captured Tickets",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.dispatch]
                    }
                });
            this.$stateProvider.state("timeline-all",
                {
                    url: "/timeline-all",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/Dispatch/timelineAll.html"
                        }
                    },
                    data: {
                        PageTitle: "All Tickets",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.dispatch]
                    }
                });

            this.$stateProvider.state("keys-slots",
                {
                    url: "/keys-slots",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/Dispatch/keysAndslots.html"
                        }
                    },
                    data: {
                        PageTitle: "Keys and Slots",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.dispatch]
                    }
                });

            this.$stateProvider.state("not-closed",
                {
                    url: "/not-closed",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/Dispatch/notClosed.html"
                        }
                    },
                    data: {
                        PageTitle: "Not Closed",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.dispatch, AppCommon.AuthService.RIGHTS.issues]
                    }
                });
            this.$stateProvider.state("closed",
                {
                    url: "/closed",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/Dispatch/closed.html"
                        }
                    },
                    data: {
                        PageTitle: "Closed Tickets",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.dispatch]
                    }
                });
            this.$stateProvider.state("cancelled",
                {
                    url: "/cancelled",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/Dispatch/cancelled.html"
                        }
                    },
                    data: {
                        PageTitle: "Cancelled",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.dispatch, AppCommon.AuthService.RIGHTS.issues]
                    }
                });
        }
    }

    angular.module("app.staff")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForDispatchContext($stateProvider, $urlRouterProvider)
        ]);

}