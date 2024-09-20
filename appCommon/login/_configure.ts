module AppCommon {
    export class ConfigureRoutesForLogin {

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state("login",
            {
                url: "/login",
                templateUrl: "/appCommon/login/login.html",
                controller: "LoginController as vm",
                data: { PageTitle: "Sign In" }
            });

            this.$stateProvider.state("logout",
            {
                url: "/logout",
                templateUrl: "/appCommon/login/logout.html",
                controller: "LoginController as vm",
                data: { PageTitle: "Logged out" }
            });

            this.$stateProvider.state("forgotpassword",
                {
                    url: "/forgotpassword",
                    templateUrl: "/appCommon/login/resetpassword.html",
                    controller: "LoginController as vm",
                    data: { PageTitle: "Reset Password" }
                });


            this.$stateProvider.state("migrated",
                {
                    url: "/migrated",
                    templateUrl: "/appCommon/login/migrated.html",
                    data: { PageTitle: "Migrated" }
                });
        }
    }

    angular.module("app.common")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForLogin($stateProvider, $urlRouterProvider)
        ]);

}