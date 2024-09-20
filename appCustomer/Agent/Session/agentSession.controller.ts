module AppCustomer {
    export class AgentSessionController extends AppCommon.ControllerBase {
        areaUrl: string;
        selectedSubnavigation: string;
        customerFriendlyName: string;

        customerName: string;

        static $inject = ["$state", "$stateParams", "$filter", "AuthService", "AccountRepository"];

        constructor(
            private $state: ng.ui.IStateService,
            private $stateParams: ng.ui.IStateParamsService,
            private $filter: ng.IFilterService,
            authService: AppCommon.AuthService,
            private accountRepository: AppCommon.AccountRepository) {

            super(authService);

            this.userInfo.customerAccountID = this.$stateParams["customerIdentifier"];// so agent can view customer info
           
            if (AppCommon.GenericUtils.isUndefinedOrNull(this.userInfo.customerAccountID)) {
                // Probably page was reloaded and no longer have customer identifier parameter
                this.$state.go(AppCustomerConfig.agentViewUiRoute);
            }
            
            this.selectedSubnavigation = $state.current.data.SelectedSubnavigation;
            this.areaUrl = $state.current.data.AreaUrl;
            
            if (this.$state.current.name === AppCustomerConfig.agentSessionCustomerAccountUiRouting.accountProfileUiRoute) {
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
                        }
                    });
            }
        }

        navigateTo(page: string): void {
            this.$state.go(page, { customerIdentifier: this.userInfo.customerAccountID });
        };
    }

    angular.module("app.customer")
        .controller("AgentSessionController",
            [
                "$state", "$stateParams", "$filter", "AuthService", "AccountRepository",
                (s, sp, f, as, ar) => new AgentSessionController(s, sp, f, as, ar)
            ])
        .filter('tel',
            AppCommon.GenericUtils.phoneNumToUSFormat);
}