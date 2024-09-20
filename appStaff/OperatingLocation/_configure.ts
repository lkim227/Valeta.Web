module AppStaff {
    export class ConfigureRoutesForOperatingLocationContext {

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state("setup-operatinglocations",
            {
                url: "/setup-operatinglocations",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/OperatingLocation/operatingLocations.html"
                    }
                },
                data: {
                    PageTitle: "Setup - Operating Locations",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.systemSetup]
                }
            });


            this.$stateProvider.state("setup-entrance",
                {
                    url: "/setup-entrance/:operatingLocationId",
                    params: {
                        operatingLocationId: null
                    },
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/OperatingLocation/entrance/entrance.html"
                        }
                    },
                    data: {
                        PageTitle: "Setup - Entrances",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.systemSetup]
                    }
                });

            this.$stateProvider.state("setup-entrance-meet-location-zone-mapping",
                {
                    url: "/setup-entrance-meet-location-zone-mapping/:operatingLocationId",
                    params: {
                        operatingLocationId: null
                    },
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/OperatingLocation/entranceMeetLocationZoneMapping/entranceMeetLocationZoneMapping.html"
                        }
                    },
                    data: {
                        PageTitle: "Entrance to Zone Mapping",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.systemSetup]
                    }
                });

            this.$stateProvider.state("setup-zone",
            {
                url: "/setup-zone/:operatingLocationId",
                params: {
                    operatingLocationId: null
                },
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/OperatingLocation/zone/zone.html"
                    }
                },
                data: {
                    PageTitle: "Setup - Zones",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.systemSetup]
                }
            });

            this.$stateProvider.state("setup-lot",
            {
                url: "/setup-lot/:operatingLocationId",
                params: {
                    operatingLocationId: null
                },
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/OperatingLocation/lot/lot.html"
                    }
                },
                data: {
                    PageTitle: "Setup - Lots & Slots",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.systemSetup]
                }
             });

            this.$stateProvider.state("setup-zone-lots",
                {
                    url: "/setup-zone-lots/:operatingLocationId",
                    params: {
                        operatingLocationId: null
                    },
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/OperatingLocation/zone/zoneLots.html"
                        }
                    },
                    data: {
                        PageTitle: "Zone to Lot Mapping",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.systemSetup]
                    }
                });


            this.$stateProvider.state("single-operatinglocation",
            {
                url: "/single-operatinglocation/:operatingLocationId",
                params: {
                    operatingLocationId: null
                },
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/OperatingLocation/singleOperatingLocation.html"
                    }
                },
                data: {
                    PageTitle: "Single Operating Location",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.systemSetup]
                }
            });
        }
    }

    angular.module("app.staff")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForOperatingLocationContext($stateProvider, $urlRouterProvider)
        ]);

}