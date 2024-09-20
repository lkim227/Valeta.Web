module AppCommon {
    export class ProfileController extends AppCommon.ControllerBase {
        errorMessage: string;
        account: AccountDTO;
        profileImageUrl: string;
        pageTitle: string;
        customerAccountUiRouting: AppCommon.CustomerAccountUiRouting;
        prefixes: Array<DefinedListDTO>;
        suffixes: Array<DefinedListDTO>;
        states: Array<DefinedListDTO>;

        userTriedSubmit: boolean;
        showEditButton: boolean;
        isConnectedIN: boolean;

        isAccessedByStaff: boolean;

        static $inject = ["$state", "$scope", "$analytics", "$http", "AuthService", "AccountRepository", "ProfileImageService", "ErrorHandlingService", "$linkedIn"];

        constructor(
            private $state: ng.ui.IStateService,
            private $scope: ng.IScope,
            private $analytics: angulartics.IAnalyticsService,
            private $http: ng.IHttpService,
            private authService: AppCommon.AuthService,
            private accountRepository: AppCommon.AccountRepository,
            private profileImageService: AppCommon.ProfileImageService,
            private errorHandlingService: AppCommon.ErrorHandlingService,
            private $linkedIn: any
        ) {
            super(authService);
            this.errorHandlingService = errorHandlingService;
            this.pageTitle = $state.current.data.PageTitle;
            this.customerAccountUiRouting = $state.current.data.CustomerAccountUiRouting;

            if (_.includes(this.userInfo.userRoles, "Employee")) {
                // probably is some staff user
                this.isAccessedByStaff = true;
            }
            else {
                // otherwise is customer logged on account
                this.isAccessedByStaff = false;
            }
            
            if (!!this.userInfo && !!this.userInfo.customerAccountID) {              
                this.getAccountByID(this.userInfo.customerAccountID);
                this.profileImageService.getProfileImageUrl(UserType.Customer, this.userInfo.customerAccountID)
                    .then((url: string) => {
                        if (!!url) {
                            this.profileImageUrl = url;
                        }
                    });
            }

            this.userTriedSubmit = false;
            this.showEditButton = true;
            this.$linkedIn.isAuthorized().then((res) => { this.isConnectedIN = res });
        }

        updateProfile(): void {
            this.loadingPromise = this.accountRepository.update(this.account, AppConfig.APIHOST);
            this.loadingPromise.then(() => {
                this.$state.go(this.customerAccountUiRouting.accountProfileUiRoute, { customerIdentifier: this.userInfo.customerAccountID });
            });
        }

        editMode(): void {
            this.$state.go(this.customerAccountUiRouting.profileEditUiRoute, { customerIdentifier: this.userInfo.customerAccountID });
        }

        cancel(): void {
            this.$state.go(this.customerAccountUiRouting.accountProfileUiRoute, { customerIdentifier: this.userInfo.customerAccountID });
        }

        addPhone(): void {
            const phone = new PhoneNumberDTO();
            this.account.ContactInformation.MorePhones.push(phone);
        }

        removePhone(ndx: number): void {
            this.account.ContactInformation.MorePhones.splice(ndx, 1);
        }

        getAccountByID(accountID: string): void {
            this.loadingPromise = this.accountRepository.getByID(accountID, AppConfig.APIHOST);
            this.loadingPromise.then((data) => {
                if (!!data.ID) {
                    if (!!data.ID) {
                        this.account = data;
                    } else {
                        //bad record
                        this.$state.go("account-profile-unavailable", null, { location: 'replace' });
                    }
                } else {
                    //bad record
                    this.$state.go("account-profile-unavailable", null, { location: 'replace' });
                }
            });
        }

        connectIN(): void {
            var self = this;
            self.$linkedIn.authorize()
                .then(() => {
                    self.$linkedIn.profile("me", ["id", "pictureUrls::(original)"])
                        .then((data) => {
                            const url = data.values[0].pictureUrls.values[0].toString(); // LinkedIn ProfileImageURL
                            self.$http.get(url, { responseType: "blob" })
                                .success(function (data: Blob) {
                                    var fr = new FileReader();
                                    fr.onload = function () {
                                        self.profileImageUrl = this.result;
                                        var resultFile = AppCommon.GenericUtils.getFileFromUri(self.profileImageUrl);
                                        self.profileImageService.uploadImage(resultFile, self.userInfo.customerAccountID, AppConfig.APIHOST, UserType.Customer);
                                    };
                                    fr.readAsDataURL(data);
                                });

                            this.isConnectedIN = true;
                        });
                });
        }

    }

    angular.module("app.common")
        .controller("ProfileController",
        [
            "$state", "$scope", "$analytics", "$http", "AuthService", "AccountRepository", "ProfileImageService", "ErrorHandlingService", "$linkedIn",
            (state, scope, an, h, auth, aRepo, piu, errSvc, lin) => new ProfileController(state, scope, an, h, auth, aRepo, piu, errSvc, lin)
        ])
        .filter('tel',
        AppCommon.GenericUtils.phoneNumToUSFormat);

}