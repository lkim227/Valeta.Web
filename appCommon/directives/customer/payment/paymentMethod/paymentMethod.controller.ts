module AppCommon {

    export class PaymentMethodController extends AppCommon.ControllerBase {
        pageTitle: string;
        accountID: string;
        isAddingNewCard: boolean;

        static $inject = ["$scope", "$state", "AuthService", "ErrorHandlingService", "PaymentMethodRepository"];

        constructor(
            private $scope: ng.IScope,
            private $state: ng.ui.IStateService,
            private authService: AppCommon.AuthService,
            private errorHandlingService: AppCommon.ErrorHandlingService,
            private paymentMethodRepository: AppCommon.PaymentMethodRepository) {

            super(authService);

            this.pageTitle = $state.current.data.PageTitle;
            this.accountID = this.userInfo.customerAccountID;

            this.isAddingNewCard = false;
        }

        addPaymentMethod(): void {
            this.isAddingNewCard = true;
        }
    }

    angular.module("app.common")
        .controller("PaymentMethodController",
        [
            "$scope", "$state", "AuthService", "ErrorHandlingService", "PaymentMethodRepository",
            (scope, state, auth, errSvc, pmRepo) => new PaymentMethodController(scope, state, auth, errSvc, pmRepo)
        ]);
}