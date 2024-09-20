module AppStaff {
    export class ResetPasswordToController extends AppCommon.ControllerBase {
        areaUrl: string;
        selectedSubnavigation: string;
        customerFriendlyName: string;
        customerName: string;
        confirmPassword: string;
        newPassword: string;
        passwordChangedSuccessfully: boolean;
        formMessages: any;
        passwordMatched: boolean;
        customerEmail: string;
        
        static $inject = ["$state", "$stateParams", "$filter", "$watch", "AuthService", "SessionService", "AccountRepository"];

        constructor(
            private $state: ng.ui.IStateService,
            private $stateParams: ng.ui.IStateParamsService,
            private $filter: ng.IFilterService,
            private $scope: ng.IScope,
            private authService: AppCommon.AuthService,
            private sessionService: AppCommon.SessionService,
            private accountRepository: AppCommon.AccountRepository) {

            super(authService);
            this.formMessages = AppCommon.FormMessages;
            this.passwordMatched = false;

            this.userInfo.customerAccountID =
                this.$stateParams["customerIdentifier"]; // so employee can view customer info
            this.selectedSubnavigation = $state.current.data.SelectedSubnavigation;
            this.areaUrl = $state.current.data.AreaUrl;
            
            this.loadingPromise = this.accountRepository.getByID(this.userInfo.customerAccountID, AppConfig.APIHOST)
                .then((data) => {
                    if (!!data) {
                        this.customerEmail = data.ContactInformation.Email.EmailAddress;

                        if (!!data.FriendlyName) {
                            this.customerFriendlyName = data.FriendlyName;
                        }
                        if (!!data.ContactInformation &&
                            !!data.ContactInformation.Name &&
                            !!data.ContactInformation.Name.First &&
                            !!data.ContactInformation.Name.Last) {

                            this.customerName = data.ContactInformation.Name.First +
                                " " +
                                data.ContactInformation.Name.Last;
                            if (!!this.customerFriendlyName) {
                            } else {
                                this.customerFriendlyName = this.customerName;
                            }
                        }
                    }
                });

            this.$scope.$watch("vm.confirmPassword",
                () => {
                    if (!!this.confirmPassword) {
                        // validate passwords match
                        if (this.confirmPassword === this.newPassword)
                            this.passwordMatched = true;
                        else
                            this.passwordMatched = false;
                    }
                },
                true);
        }

        navigateTo(page: string): void {
            this.$state.go(page, { customerIdentifier: this.userInfo.customerAccountID });
        }

        resetPasswordTo = () => {
            this.loadingPromise = this.authService.resetPasswordTo(this.customerEmail, this.newPassword);
            this.loadingPromise.then((success) => {
                    this.passwordChangedSuccessfully = success;
                });
        };
    }

    angular.module("app.staff")
        .controller("ResetPasswordToController",
            [
                "$state", "$stateParams", "$filter", "$scope", "AuthService", "SessionService", "AccountRepository",
                (s, sp, f, scope, as, ss, ar) => new ResetPasswordToController(s, sp, f, scope, as, ss, ar)
            ]);
}