module AppCustomer {
    export class ConfigureRoutesForAccount {
        dashboardState: ng.ui.IState;
        accountProfileState: ng.ui.IState;
        accountProfileEditState: ng.ui.IState;
        changePasswordState: ng.ui.IState;
        accountVehicleState: ng.ui.IState;
        accountPaymentMethodState: ng.ui.IState;

        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.accountProfileState = {
                name: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountProfileUiRoute,
                url: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountProfileUiUrl,
                views: AppCustomerConfig.accountProfileViews,
                data: {
                    PageTitle: "My Account",
                    SelectedSubnavigation: "Profile",
                    AreaUrl: "/appCommon/directives/customer/profile/profile.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                }
            };
            this.$stateProvider.state(this.accountProfileState);

            this.accountProfileEditState = {
                name: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.profileEditUiRoute,
                url: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountProfileUiUrl,
                views: AppCustomerConfig.accountProfileViews,
                data: {
                    PageTitle: "My Account",
                    SelectedSubnavigation: "Profile",
                    AreaUrl: "/appCommon/directives/customer/profile/profile.edit.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                }
            };
            this.$stateProvider.state(this.accountProfileEditState);

            this.changePasswordState = {
                name: "change-password",
                url: "/change-password/:id",
                views: AppCustomerConfig.accountProfileViews,
                data: {
                    PageTitle: "My Account",
                    SelectedSubnavigation: "Change Password",
                    AreaUrl: "/appCustomer/Account/changePassword.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                }
            };
            this.$stateProvider.state(this.changePasswordState);
            this.accountVehicleState = {
                name: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountVehiclesUiRoute,
                url: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountVehiclesUiUrl,
                views: AppCustomerConfig.accountProfileViews,
                data: {
                    PageTitle: "My Account",
                    SelectedSubnavigation: "Vehicles",
                    AreaUrl: "/appCustomer/Account/vehicles.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                }
            };
            this.$stateProvider.state(this.accountVehicleState);

            this.accountPaymentMethodState = {
                name: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountPaymentMethodsUiRoute,
                url: AppCommon.AppCommonConfig.defaultCustomerAccountUiRouting.accountPaymentMethodsUiUrl,
                views: AppCustomerConfig.accountProfileViews,
                data: {
                    PageTitle: "My Account",
                    SelectedSubnavigation: "Credit Cards",
                    AreaUrl: "/appCustomer/Account/accountPaymentMethods.html",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.customer]
                }
            };
            this.$stateProvider.state(this.accountPaymentMethodState);
        }
    }

    angular.module("app.customer")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForAccount($stateProvider, $urlRouterProvider)
        ]);

}