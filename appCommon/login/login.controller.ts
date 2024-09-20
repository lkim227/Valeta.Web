module AppCommon {
    export class LoginController extends ControllerBase {
        pageTitle: string;

        loginCredential: LoginCredential;
        email: string;
        showResetMessage: boolean;
        publicKey: string = AppCommonConfig.recaptchaPublicKey;

        static $inject = ["$state", "vcRecaptchaService", "AuthService"];

        constructor(private $state: ng.ui.IStateService,
            private vcRecaptchaService: any,
            private authService: AuthService) {

            super(authService);
            this.pageTitle = $state.current.data.PageTitle;
            this.loginCredential = new LoginCredential();
            this.loginCredential.Grant_Type = "password";
            this.showResetMessage = false;

            if (this.$state.current.name === "logout") {
                this.logout();
            }
        }

        login(): void {
            this.loadingPromise = this.authService.login(this.loginCredential, true);
            this.loadingPromise.then((userInfo: UserInfo) => {
                if (_.includes(userInfo.userRoles, "Employee")) {
                    location.href = "/appStaff";
                } else {
                    location.href = "/appCustomer";
                }
            });
        }

        logout(): void {
            this.authService.logout();
        }

        resetPassword(): void {
            this.loadingPromise = this.authService.resetPassword(this.email);
            this.loadingPromise.then(() => {
                this.showResetMessage = true;
            });
        }
    }

    angular.module("app.common")
        .controller("LoginController",
        [
            "$state", "vcRecaptchaService", "AuthService",
            (state, vc, auth) => new LoginController(state, vc, auth)
        ]);
}