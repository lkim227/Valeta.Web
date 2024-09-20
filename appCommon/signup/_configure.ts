module AppCommon {
    export class ConfigureRoutesForSignup {

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state("signup",
            {
                url: "/signup",
                templateUrl: "/appCommon/signup/signup.html",
                controller: "SignupController as vm",
                data: { PageTitle: "Sign Up" }
            });

            //This is for drive-up customers to activate their account after a valet creates a customer record for them
            //Activate is from Valet.Contracts.ValetConfiguration
            this.$stateProvider.state("activate",
            {
                url: "/activate/:accountId",
                params: {
                    accountId: null
                },
                templateUrl: "/appCommon/signup/activate.html",
                controller: "SignupController as vm",
                data: { PageTitle: "Activate Account" }
            });
        }
    }

    angular.module("app.common")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForSignup($stateProvider, $urlRouterProvider)
        ]);

}