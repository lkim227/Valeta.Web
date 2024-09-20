module AppCustomer {

    export class AccountController extends AppCommon.ControllerBase {

        areaUrl: string;
        currentPage: string;
        accountID: string;
        selectedSubnavigation: string;

        static $inject = ["$state", "AuthService"];

        constructor(private $state: ng.ui.IStateService, authService: AppCommon.AuthService) {
            super(authService);
            this.selectedSubnavigation = $state.current.data.SelectedSubnavigation;
            this.areaUrl = $state.current.data.AreaUrl;
        }

        navigateTo(page: string): void {
            this.$state.go(page);
        }
    }

    angular.module("app.customer")
        .controller("AccountController",
        [
            "$state", "AuthService",
            (state, auth) => new AccountController(state, auth)
        ]);
}