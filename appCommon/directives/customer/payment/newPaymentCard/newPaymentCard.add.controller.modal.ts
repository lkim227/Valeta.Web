module AppCommon {

    export class PaymentCardAddModalController extends AppCommon.ControllerBase {
        pageTitle: string;

        cardPlaceholders: any;
        cardMessages: any;
        cardOptions: any;
        formMessages: any;
        useContactAddress: boolean;
        canUseMailingAddress: boolean;
        mailingAddress: AddressDTO;

        static $inject = ["$scope", "$uibModalInstance", "AuthService", "ErrorHandlingService", "AccountRepository", "NewPaymentCardRepository", "newPaymentCard"];

        constructor(private $scope: any,
                    private $uibModalInstance: angular.ui.bootstrap.IModalServiceInstance,
                    private authService: AppCommon.AuthService,
                    private errorHandlingService: AppCommon.ErrorHandlingService,
                    private accountRepository: AppCommon.AccountRepository,
                    private newPaymentCardRepository: AppCommon.NewPaymentCardRepository,
                    public newPaymentCard: NewPaymentCardDTO) {

            super(authService);

            this.pageTitle = "Add new payment";
            this.formMessages = AppCommon.FormMessages;
            
            this.initializeForm();
            this.getSupportingData();
            this.resetForm();
        }

        getSupportingData(): void {
            this.canUseMailingAddress = false;

            this.loadingPromise = this.accountRepository.getByID(this.userInfo.customerAccountID, AppConfig.APIHOST);
            this.loadingPromise.then((account: AccountDTO) => {
                if (!!account && !!account.ContactInformation) {
                    this.mailingAddress = account.ContactInformation.MailingAddress;
                    if (!!this.mailingAddress && !!this.mailingAddress.Line1 && !!this.mailingAddress.PostalCode) {
                        this.canUseMailingAddress = true;
                    }
                }
            });
        }

        useContactAddressChanged(): void {
            if (this.useContactAddress) {
                //copy address over
                this.newPaymentCard.BillingAddress = new AddressDTO();
                this.newPaymentCard.BillingAddress.Line1 = this.mailingAddress.Line1;
                this.newPaymentCard.BillingAddress.Line2 = this.mailingAddress.Line2;
                this.newPaymentCard.BillingAddress.City = this.mailingAddress.City;
                this.newPaymentCard.BillingAddress.State = this.mailingAddress.State;
                this.newPaymentCard.BillingAddress.PostalCode = this.mailingAddress.PostalCode;
            }
        }

        saveNewPaymentCard(): void {
            this.loadingPromise = this.newPaymentCardRepository.insert(this.newPaymentCard, AppConfig.APIHOST);
            this.loadingPromise.then((success) => {
                if (success) {
                    this.$scope.$emit('savePaymentCard', this.newPaymentCard);
                }

                this.$uibModalInstance.close(this.newPaymentCard);
            });
        }

        cancelAddNewPaymentCard(): void {
            this.errorHandlingService.removePageErrors();

            this.$uibModalInstance.dismiss("cancel");
        }

        resetForm() {
            this.errorHandlingService.removePageErrors();
            this.newPaymentCard = new NewPaymentCardDTO();
            this.newPaymentCard.AccountID = this.userInfo.customerAccountID;
        }

        initializeForm() {
            this.cardPlaceholders = {
                number: "xxxx xxxx xxxx xxxx",
                expiry: "MM/YYYY",
                ccv: "xxx",
                name: " "
            };

            this.cardMessages = {
                validDate: "valid\nthru",
                monthYear: "MM/YYYY"
            };

            this.cardOptions = {
                debug: false,
                formatting: true
            };
        }
    }

    angular.module("app.common")
        .controller("PaymentCardAddModalController",
        [
            "$scope", "$uibModalInstance", "AuthService", "ErrorHandlingService", "AccountRepository", "NewPaymentCardRepository", "newPaymentCard",
            (scope, uibi, auth, errSvc, aRepo, npcRepo, nPC) => new PaymentCardAddModalController(scope, uibi, auth, errSvc, aRepo, npcRepo, nPC)
        ]);
}