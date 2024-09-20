module AppStaff {
    export class CustomerSessionController extends AppCommon.ControllerBase {
        areaUrl: string;
        selectedSubnavigation: string;
        customerFriendlyName: string;

        customerName: string;
        mobilePhone: string;
        emailAddress: string;
        currentCommunicationContext: string;
        adHocCommunicationUrl: string;

        static $inject = ["$state", "$stateParams", "$filter", "AuthService", "AccountRepository"];

        constructor(
            private $state: ng.ui.IStateService,
            private $stateParams: ng.ui.IStateParamsService,
            private $filter: ng.IFilterService,
            authService: AppCommon.AuthService,
            private accountRepository: AppCommon.AccountRepository) {

            super(authService);
            this.userInfo.customerAccountID = this.$stateParams["customerIdentifier"]; // so employee can view customer info
            this.selectedSubnavigation = $state.current.data.SelectedSubnavigation;
            this.areaUrl = $state.current.data.AreaUrl;
            
            //console.log("CustomerSessionController " + this.userInfo.customerAccountID + " " + this.$state.current.name);

            if (this.$state.current.name === "account-profile") {
                this.customerFriendlyName = ''; // profile displays name already
            } else {
                this.accountRepository.getByID(this.userInfo.customerAccountID, AppConfig.APIHOST)
                    .then((data) => {
                        if (!!data) {
                            if (!!data.FriendlyName) {
                                this.customerFriendlyName = data.FriendlyName;
                            }
                            if (!!data.ContactInformation &&
                                !!data.ContactInformation.Name &&
                                !!data.ContactInformation.Name.First &&
                                !!data.ContactInformation.Name.Last) {

                                this.customerName = data.ContactInformation.Name.First +
                                    " " + data.ContactInformation.Name.Last;
                                if (!!this.customerFriendlyName) {
                                } else {
                                    this.customerFriendlyName = this.customerName;
                                }
                            }

                            this.mobilePhone = data.ContactInformation.MobilePhone.Number;
                            this.emailAddress = data.ContactInformation.Email.EmailAddress;
                        }
                    });
            }

            this.currentCommunicationContext = AppCommon.CommunicationUtils.referenceContextCustomer;
            this.adHocCommunicationUrl = AppCommon.CommunicationUtils.buildAdHocCommunicationUrl(AppCommon.CommunicationUtils.referenceContextCustomer);
        }

        navigateTo(page: string): void {
            this.$state.go(page, { customerIdentifier: this.userInfo.customerAccountID });
        }
    }

    angular.module("app.staff")
        .controller("CustomerSessionController",
            [
                "$state", "$stateParams", "$filter", "AuthService", "AccountRepository",
                (s, sp, f, as, ar) => new CustomerSessionController(s, sp, f, as, ar)
            ])
        .filter('tel',
            AppCommon.GenericUtils.phoneNumToUSFormat);
}