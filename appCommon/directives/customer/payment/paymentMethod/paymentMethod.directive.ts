module AppCommon {
    export interface IPaymentMethodAttrs extends AppCommon.IListViewDirectiveBaseAttributes {
        accountId: string;
        template: string;
    }

    export interface IPaymentMethodScope extends AppCommon.IListViewDirectiveBaseScope {
        directiveInitialized: boolean;
        selectedPaymentMethodId: string;
        selectedPaymentMethodFriendlyName: string;
        selectedPaymentMethodIsAuthorized: boolean;
        fetchPaymentMethods: boolean;
        paymentMethods: Array<PaymentMethodDTO>;
        selectedPaymentMethodIdForKendoCombo: string;
        
        onAdd: () => void;
        onSave: (e: any) => void;
        onChange: (dataItem: any) => void;
        onEdit: (dataItem: any) => void;
        onCancel: (dataItem: any) => void;
        onDelete: (e: any) => void;
        onClick: (dataItem: any) => void;
        onSelect: (e: any) => void;

        isInEditMode: boolean;
        formMessages: any;
        cardPlaceholders: any;
        cardMessages: any;
        cardOptions: any;

        showNoPaymentsMessage: boolean;

        initializeForm(): void;

        //for dropdown
        paymentMethodKendoTemplate: any;
    }

    export class PaymentMethodDirective extends AppCommon.ListViewDirectiveBase {
        restrict = "E";
        templateUrl = function(elem, attr) {
            return attr.template;
        };
        scope = {
            selectedPaymentMethodId: "=?",
            selectedPaymentMethodFriendlyName: "=?",
            selectedPaymentMethodIsAuthorized: "=?",
            paymentMethods: "=?",
            fetchPaymentMethods: "=?"
        };
        static $inject = ["$timeout", "$uibModal", "Restangular", "SessionService", "ErrorHandlingService", "AuthService", "KendoDataSourceService", "PaymentMethodRepository"];

        constructor(
            private $timeout: ng.ITimeoutService,
            private $uibModal: angular.ui.bootstrap.IModalService,
            private restng: restangular.IService,
            private sessionService: AppCommon.SessionService,
            private errorHandlingService: AppCommon.ErrorHandlingService,
            private authService: AppCommon.AuthService,
            private kendoDataSourceService: AppCommon.KendoDataSourceService,
            private paymentMethodRepository: AppCommon.PaymentMethodRepository) {
            super();
        }

        link: ng.IDirectiveLinkFn = (scope: IPaymentMethodScope, elements: ng.IAugmentedJQuery, attrs: IPaymentMethodAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            var listview = $("#listView").data("kendoListView");
            var dropdown = $("#dropDown").data("kendoComboBox");

            self.initializeScope(scope, attrs);
            if (scope.paymentMethods || (typeof scope.fetchPaymentMethods === "boolean" && scope.fetchPaymentMethods === false)) {
                scope.dataSource = new kendo.data.DataSource({ data: scope.paymentMethods });
            } else {
                scope.dataSource = self.kendoDataSourceService.getDataSource(CommonConfiguration_Routing.PaymentMethodRoute, CommonConfiguration_Routing_PaymentMethodMethods.GetByAccountID, self.sessionService.userInfo.customerAccountID);
            }
            scope.showNoPaymentsMessage = (scope.dataSource === null && scope.dataSource.data.length === 0);

            scope.formMessages = AppCommon.FormMessages;
            scope.cardPlaceholders = {
                number: "xxxx xxxx xxxx xxxx",
                expiry: "MM/YYYY",
                ccv: "xxx",
                name: " "
            };

            scope.cardMessages = {
                validDate: "valid\nthru",
                monthYear: "MM/YYYY"
            };

            scope.cardOptions = {
                debug: false,
                formatting: true
            };


            scope.onEdit = e => {
                scope.isInEditMode = true;
            };
            scope.onCancel = e => {
                scope.isInEditMode = false;
            };
            scope.onChange = dataItem => {
                if (!!dataItem) {
                    var item = listview.element.children(`[data-uid='${dataItem.uid}']`);
                    if (item.hasClass("checkbox--disabled")) {
                        listview.clearSelection();
                        scope.selectedPaymentMethodId = null;
                        scope.selectedPaymentMethodFriendlyName = null;
                        return;
                    }
                    scope.selectedPaymentMethodId = dataItem.ID;
                    scope.selectedPaymentMethodFriendlyName = dataItem.FriendlyName;
                }
            };
            scope.onSelect = e => {
                if (!!e.item) {
                    const index: number = e.item[0].dataset.offsetIndex;
                    scope.selectedPaymentMethodId = scope.paymentMethods[index].ID;
                    scope.selectedPaymentMethodFriendlyName = scope.paymentMethods[index].FriendlyName;
                }
            };

            scope.onDelete = e => {
                var response = confirm("Are you sure you want to delete this payment method?");
                if (response === false) {
                    e.preventDefault();
                    return;
                }

                if (e.model.ID === scope.selectedPaymentMethodId) {
                    listview.clearSelection();
                    scope.selectedPaymentMethodId = null;
                    scope.selectedPaymentMethodFriendlyName = null;
                }

                scope.isInEditMode = false;
            };
            scope.onClick = dataItem => {
                var item = listview.element.children(`[data-uid='${dataItem.uid}']`);
                listview.select(item);
            };
            scope.onSave = e => {
                e.preventDefault();
                var model: PaymentMethodDTO = e.model;

                var mm: string = "";
                if (model.PaymentGatewayFields.ExpirationMonth < 10) {
                    mm = "0" + model.PaymentGatewayFields.ExpirationMonth;
                } else {
                    mm = "" + model.PaymentGatewayFields.ExpirationMonth;
                }
                var mmyyyy = mm + model.PaymentGatewayFields.ExpirationYear;
                var ccv = e.model.newCCV;
                if (mmyyyy.length > 0 && ccv.length > 0) {
                    var dto = new UpdatedPaymentCardDTO();
                    dto.PaymentMethod = new PaymentMethodDTO();
                    dto.PaymentMethod.ID = model.ID;
                    dto.PaymentMethod.IsArchived = false;
                    dto.PaymentMethod.AccountID = model.AccountID;
                    dto.PaymentMethod.PaymentGatewayPaymentID = model.PaymentGatewayPaymentID;
                    dto.PaymentMethod.Type = model.Type;
                    dto.PaymentMethod.Note = model.Note;
                    dto.PaymentMethod.IsAuthorized = model.IsAuthorized;
                    dto.PaymentMethod.BillingAddress = model.BillingAddress;
                    dto.ExpirationMonthAndYear = mmyyyy;
                    dto.CCV = ccv;

                    scope.loadingPromise = this.paymentMethodRepository.updatePayment(dto);
                    scope.loadingPromise.then(() => {
                        scope.dataSource.read();
                        scope.isInEditMode = false;
                    });
                }
            };
            scope.onAdd = () => {
                var newPC = new NewPaymentCardDTO();
                var npcRepo = new AppCommon.NewPaymentCardRepository(this.restng, this.errorHandlingService);
                var aRepo = new AppCommon.AccountRepository(this.restng, this.errorHandlingService);

                var modalInstance: angular.ui.bootstrap.IModalServiceInstance = this.$uibModal.open({
                    animation: true,
                    templateUrl: "/appCommon/directives/customer/payment/newPaymentCard/newPaymentCard.add.modal.html",
                    controller: () => new PaymentCardAddModalController(scope, modalInstance, this.authService, this.errorHandlingService, aRepo, npcRepo, newPC),
                    controllerAs: "addVm",
                    resolve: {
                        newPaymentCard: () => newPC
                    },
                    windowClass: "modal-window-wide"
                });

                scope.loadingPromise = modalInstance.result;
                scope.loadingPromise.then(data => {
                    if (!!data) {
                        scope.dataSource.read();
                    }
                });
            };

            // should reload credit cards list after saving/add new one
            scope.$on('savePaymentCard', (event, data) => {
                scope.dataSource.read();
            });

//            scope.authorize = (pmID: string): boolean => {
//                //authorize this card
//                var authorizationTries = 0;
//                this.paymentMethodRepository.authorizePaymentMethod(pmID).then((isAuthorized) => {
//                    console.log("authorize attempt #" + authorizationTries + "? result=" + isAuthorized);
//                    authorizationTries += 1;
//                    if (isAuthorized || authorizationTries > 2) {
//                        return true;
//                    }
//                });
//                return false;
//            }
            
            //var initializeDirective = () => {
            //    //init values
            //    scope.selectedPaymentMethodIdForKendoCombo = scope.selectedPaymentMethodId;

            //    scope.directiveInitialized = true;
            //}
            //var waitForScopeVariables = () => {
            //    var deregisterWait = scope.$watch("selectedPaymentMethodId",
            //        (newValue) => {
            //            if (typeof (newValue) === "undefined") {
            //                scope.selectedPaymentMethodId = null;
            //            }
            //            deregisterWait();
            //            initializeDirective();
            //        });;
            //}
            //var waitForDom = () => {
            //    waitForScopeVariables();
            //}
            //setTimeout(waitForDom, 0);


            listview.bind("remove", (e) => scope.onDelete(e));
            scope.paymentMethodKendoTemplate = $("#paymentMethodKendoTemplate").html();


        };
    }

    angular.module("app.common")
        .directive("paymentMethod",
        [
            "$timeout", "$uibModal", "Restangular", "SessionService", "ErrorHandlingService", "AuthService", "KendoDataSourceService", "PaymentMethodRepository",
            (t, uib, restang, sessionService, err, auth, kendoDS, payRepo) => new PaymentMethodDirective(t, uib, restang, sessionService, err, auth, kendoDS, payRepo)
        ]);
}