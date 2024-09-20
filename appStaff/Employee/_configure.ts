module AppStaff {
    export class ConfigureRoutesForEmployeeContext {

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state("employee-home",
                {
                    url: "/employee-home",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/Employee/employeeHome.html"
                        }
                    },
                    data: {
                        PageTitle: "Home",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee]
                    }
                });

            this.$stateProvider.state("employee-admin",
            {
                url: "/employee-admin",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/Employee/employee.admin.html"
                    }
                },
                data: {
                    PageTitle: "Employees",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.employees]
                }
            });

            this.$stateProvider.state("valet-log",
            {
                url: "/valet-log",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/Employee/valetLog.html"
                    }
                },
                data: {
                    PageTitle: "Log",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.employees]
                }
            });

            this.$stateProvider.state("valet-tips",
                {
                    url: "/valet-tips",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/Employee/valetTips.html"
                        }
                    },
                    data: {
                        PageTitle: "Tips",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.employees]
                    }
                });




            this.$stateProvider.state("change-staff-password",
                {
                    url: "/change-staff-password",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/PersonalManagement/changeStaffPassword.html"
                        }
                    },
                    data: {
                        PageTitle: "Change Password",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee]
                    }
                });
            this.$stateProvider.state("my-valet-log",
                {
                    url: "/my-valet-log",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/PersonalManagement/myValetLog.html"
                        }
                    },
                    data: {
                        PageTitle: "My Log",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee]
                    }
                });
            this.$stateProvider.state("my-valet-tips",
                {
                    url: "/my-valet-tips",
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: "/appStaff/PersonalManagement/myValetTips.html"
                        }
                    },
                    data: {
                        PageTitle: "My Tips",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee]
                    }
                });
        }
    }

    angular.module("app.staff")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForEmployeeContext($stateProvider, $urlRouterProvider)
        ]);

}