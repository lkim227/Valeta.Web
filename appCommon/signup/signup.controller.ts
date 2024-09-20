module AppCommon {
    export class SignupController extends ControllerBase {
        errorMessage: string;
        pageTitle: string;
        signupNewCustomer: SignupNewCustomerDTO;
        loginCredential: LoginCredential;
        profileImageUrl: string; 
        isConnectedIN: boolean;
        accountIDParam: string;
        publicKey: string = AppCommonConfig.recaptchaPublicKey;

        static $inject = ["$state", "$stateParams", "$analytics", "$http", "vcRecaptchaService", "AuthService", "AccountRepository", "ProfileImageService", "$linkedIn"];

        constructor(private $state: ng.ui.IStateService,
                    private $stateParams: ng.ui.IStateParamsService,
                    private $analytics: angulartics.IAnalyticsService,
                    private $http: ng.IHttpService,
                    private vcRecaptchaService: any,
                    private authService: AuthService,
                    private accountRepository: AccountRepository,
                    private profileImageService: AppCommon.ProfileImageService,
                    private $linkedIn: any) {

            super(authService);
            this.pageTitle = $state.current.data.PageTitle;
            this.isConnectedIN = false;
            this.profileImageUrl = null;

            this.signupNewCustomer = new SignupNewCustomerDTO();
            this.signupNewCustomer.ID = AppCommon.GuidService.NewGuid();
            this.signupNewCustomer.OnPlatform = "web";

            this.accountIDParam = this.$stateParams["accountId"];
            this.prefillAccountInformation();
        }

        prefillAccountInformation(): void {
            if (!!this.accountIDParam) {
                this.accountRepository.getByID(this.accountIDParam, AppConfig.APIHOST).then((data) => {
                    if (!!data) {
                        this.signupNewCustomer.ID = data.ID;
                        this.signupNewCustomer.OnPlatform = "web";
                        this.signupNewCustomer.FirstName = data.ContactInformation.Name.First;
                        this.signupNewCustomer.LastName = data.ContactInformation.Name.Last;
                        this.signupNewCustomer.EmailAddress = data.ContactInformation.Email.EmailAddress;
                        this.signupNewCustomer.MobilePhone = data.ContactInformation.MobilePhone.Number;
                    }
                });
            }
        }

        signUpNewAccount(): void {
            this.loadingPromise = this.accountRepository.doSignup(this.signupNewCustomer);
            this.loadingPromise.then((success) => {
                if (success) {
                    this.$analytics.eventTrack("Signup-Done", { category: "Signup" });
                    this.loginNewUser();
                }
            });
        }

        //TODO: move account activation to its own controller
        //activateAccount(): void {
        //    this.account.IsActivated = true;

        //    this.loadingPromise = this.accountRepository.update(this.account, AppConfig.APIHOST);
        //    this.loadingPromise.then((success) => {
        //        if (success) {
        //            this.$analytics.eventTrack("Activate-Done", { category: "Signup" });
        //            this.loginNewUser();
        //        }
        //    });
        //}


        connectIN(): void {
            var self = this;
            self.$linkedIn.authorize()
                    .then(() => {
                        self.loadingPromise = self.$linkedIn.profile("me", ["id", "firstName", "lastName", "emailAddress", "pictureUrls::(original)"]);
                        self.loadingPromise.then((data) => {
                            let userInfo = data.values[0]; // LinkedIn Profile

                            self.signupNewCustomer = new SignupNewCustomerDTO();
                            self.signupNewCustomer.OnPlatform = "web";
                            self.signupNewCustomer.FirstName = userInfo.firstName;
                            self.signupNewCustomer.LastName = userInfo.lastName;
                            self.signupNewCustomer.EmailAddress = userInfo.emailAddress;

                            const url = data.values[0].pictureUrls.values[0].toString(); // LinkedIn ProfileImageURL
                            self.$http.get(url, { responseType: "blob" })
                                .success(function (data: Blob) {
                                    var fr = new FileReader();
                                    fr.onload = function () {
                                        self.profileImageUrl = this.result;
                                    };
                                    fr.readAsDataURL(data);
                                });

                            this.isConnectedIN = true;
                        });
                });
        }

        loginNewUser(): void {
            const loginCredential = new LoginCredential();
            loginCredential.Username = this.signupNewCustomer.EmailAddress;
            loginCredential.Password = this.signupNewCustomer.Password;

            this.authService.login(loginCredential, true)
                .then(() => {
                    if (this.isConnectedIN) {
                        var resultFile = AppCommon.GenericUtils.getFileFromUri(this.profileImageUrl);
                        this.profileImageService.uploadImage(resultFile, this.authService.getSession().customerAccountID, AppConfig.APIHOST, UserType.Customer);
                    }
                    location.href = "/appCustomer";
                });
        }
    }

    angular.module("app.common")
        .controller("SignupController",
        [
            "$state", "$stateParams", "$analytics", "$http", "vcRecaptchaService", "AuthService", "AccountRepository", "ProfileImageService", "$linkedIn", 
            (state, sparams, analytics, h, vc, auth, ar, piu, lin) => new SignupController(state, sparams, analytics, h, vc ,auth, ar, piu, lin)
        ]);
}