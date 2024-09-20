module AppCommon {
    export interface ICustomerListAttributes extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface ICustomerListScope extends ng.IScope {
        createdBy: string;
        accessLevel: AccessLevel;
        hasEditAccess: boolean;

        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;

        agentID: string;

        goToCustomer(account: AccountDTO): void;
        newReservation(account: AccountDTO): void;

        refresh(): void;

        addCustomerModal: any;
        addNewCustomer(): void;
        openAddCustomer(): void;
        onCancel(): void;
        deleteCustomer(dataItem: AccountDTO);
        formMessages: any;

        addCustomerForm: ng.IFormController;
        onSelectReference(selected: OmnisearchQueryResult): void;

        customers: AccountDTO[];
        customerIDs: string[];

        newCustomerID: string;
    }

    class CustomerListDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appCommon/directives/agent/customerList.directive.html";
        scope = {
        };

        static $inject = ["$state", "$stateParams", "SessionService", "AuthService", "AgentQuery", "$uibModal"];

        constructor(
            private $state: ng.ui.IStateService,
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private agentQuery: AppCommon.AgentQuery,
            private $uibModal) {
        }

        link: ng.IDirectiveLinkFn = (scope: ICustomerListScope, elements: ng.IAugmentedJQuery, attrs: ICustomerListAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;

            scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.customers);
            scope.hasEditAccess = scope.accessLevel >= AccessLevel.Edit;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canCreate = getBooleanAttribute(attrs.canCreate);
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate);
            scope.canDelete = getBooleanAttribute(attrs.canDelete);
            scope.createdBy = self.sessionService.userInfo.employeeFriendlyID;
            
            scope.agentID = this.sessionService.userInfo.customerAccountID;
            scope.customers = [];
            scope.customerIDs = [];

            scope.refresh = () => {
                self.agentQuery.getByID(scope.agentID)
                    .then((data) => {
                        if (!!data) {
                            scope.customers = data.Accounts;
                            scope.customerIDs = data.AccountIDs;
                        }
                    });
            };
            
            scope.addNewCustomer = () => {
                if (!!scope.newCustomerID) {
                    scope.customerIDs.push(scope.newCustomerID)
                    
                    self.agentQuery.upsert(scope.agentID, scope.customerIDs)
                        .then(() => {
                            scope.refresh();
                        });
                    scope.addCustomerModal.close();
                }
            };
            scope.openAddCustomer = () => {
                scope.addCustomerModal = this.$uibModal.open({
                    templateUrl: 'addCustomerModalContent',
                    size: 'md',
                    scope: scope
                });
            };
            scope.onCancel = () => {
                scope.addCustomerModal.close();

                if (!!scope.addCustomerForm) {
                    scope.addCustomerForm.$setPristine();
                    scope.addCustomerForm.$setUntouched();
                }
            };
           
            // scope.$watch("selectedIssueReference") NOT WORKING
            scope.onSelectReference = (selected: OmnisearchQueryResult): void => {
                if (selected.ResultType == OmnisearchResultType.CustomerCurrentRecord) {
                    scope.newCustomerID = selected.ID;
                }

                if (selected.ResultType == OmnisearchResultType.TicketCurrentRecord) {
                    alert("Please select a customer.");
                }
            }

            scope.deleteCustomer = (dataItem: AccountDTO) => {
                if (!!dataItem.ID) {
                    var response = confirm("Are you sure you want to delete " + dataItem.FriendlyName + " customer?");
                    if (response === false) {
                        return;
                    }

                    var index = scope.customerIDs.indexOf(dataItem.ID);
                    if (index >= 0) {
                        scope.customerIDs.splice(index, 1);

                        self.agentQuery.upsert(scope.agentID, scope.customerIDs)
                            .then(() => {
                                scope.refresh();
                            });
                    }
                }
            };

            scope.refresh();
        }
    }

    angular.module("app.common")
        .directive("customerList",
        [
            "$state", "$stateParams", "SessionService", "AuthService", "AgentQuery", "$uibModal",
            (s, sparams, session, auth, a, $uibModal) => new CustomerListDirective(s, sparams, session, auth, a, $uibModal)
        ]);
}