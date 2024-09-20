module AppCommon {

    export interface IReservationHistoryScope extends AppCommon.IListViewDirectiveBaseScope {
        analyticsEventName: string;
        cancelled: boolean;
        createdBy: string;
        customerIdentifierParam: string;
        
        newReservation: () => void;
        deleteReservation: (dataItem: any) => void;
        
        onClick: (dataItem: any) => void;

        viewEditable(item: ReservationAndTicketHistory): void;
        viewReservation(item: ReservationAndTicketHistory): void;
        viewTicket(ticketNumber: string): void;
        viewBillingDocument(item: ReservationAndTicketHistory): void;

        showCancelled(): void;
        hideCancelled(): void;
        sortOnField(newSortField: string): void;

        billingDocumentUrl: string;
        enumUtils: AppCommon.EnumUtils;
    }

    class ReservationHistoryDirective extends AppCommon.ListViewDirectiveBase {
        templateUrl = AppCommonConfig.reservationHistoryTemplateUrl;
        scope = {
            analyticsEventName: "@"
        };

        static $inject = ["$window", "$state", "$stateParams", "SessionService", "KendoDataSourceService",
            "ReservationStatusChangeService", "ValetServiceCommand"];

        constructor(
            private $window: Window,
            private $state: ng.ui.IStateService,
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private kendoDataSourceService: AppCommon.KendoDataSourceService,
            private reservationStatusChangeService: AppCommon.ReservationStatusChangeService,
            private valetServiceCommand: AppCommon.ValetServiceCommand
        ) {
            super();
        }

        link: ng.IDirectiveLinkFn = (scope: IReservationHistoryScope, elements: ng.IAugmentedJQuery, attrs: AppCommon.IListViewDirectiveBaseAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;

            scope.enumUtils = AppCommon.EnumUtils;
            scope.billingDocumentUrl = "/appCommon/directives/ticket/billingDocument.html";

            // so employee can view customer info
            scope.customerIdentifierParam = this.$stateParams["customerIdentifier"];
            if (!!scope.customerIdentifierParam) {
                self.sessionService.userInfo.customerAccountID = self.$stateParams["customerIdentifier"]; 
            }
            scope.createdBy = self.sessionService.userInfo.customerAccountID;

            var listview = $("#listView").data("kendoListView");
            
            self.initializeScope(scope, attrs);
            //console.log(self.sessionService.userInfo.customerAccountID);

            scope.dataSource = self.kendoDataSourceService.getDataSource(
                "CustomerReservationAndTicketHistory",
                null,
                self.sessionService.userInfo.customerAccountID,
                null);
            scope.dataSource.filter([
                { field: "StatusDisplay", operator: "neq", value: "Cancelled" }
            ]);
            scope.dataSource.fetch(() => {          //manually fetch so we can control changing state if need be
                var recordCount = scope.dataSource.total();
                if (recordCount === 0) {
                   // this.$state.go("make-reservation");
                } else {
                    listview.setDataSource(scope.dataSource);
                    listview.refresh();   
                }
            });

            scope.cancelled = false;
            
            scope.newReservation = (): void => {
                var url = self.$state.href("make-reservation");
                if (!!scope.customerIdentifierParam) {
                    url = self.$state.href("make-reservation", { customerIdentifier: self.sessionService.userInfo.customerAccountID });
                }
                window.open(url, "_self");
            };
            scope.showCancelled = (): void => {
                scope.cancelled = true;
                scope.dataSource.filter([]);
            };
            scope.hideCancelled = (): void => {
                scope.cancelled = false;
                scope.dataSource.filter([
                    { field: "StatusDisplay", operator: "neq", value: "Cancelled" }
                ]);
            };
            scope.viewReservation = (item: ReservationAndTicketHistory): void => {
                if (!!self.$window.localStorage) {
                    self.$window.localStorage.setItem("incompleteReservationID", item.ID);
                    self.$window.localStorage.setItem("incompleteReservationCustomerID", item.CustomerID);
                }

                var url = this.$state.href("make-reservation");
                if (!!scope.customerIdentifierParam) {
                    url = this.$state.href("make-reservation", { customerIdentifier: self.sessionService.userInfo.customerAccountID });
                }
                window.open(url, "_self");
            };

            scope.viewTicket = (ticketNumber: string): void => {
                var url = self.$state.href("ticket", { ticketNumber: ticketNumber });
                window.open(url, "_self");
            }

            scope.viewEditable = (item: ReservationAndTicketHistory): void => {
                if (item.IsReservationWithoutTicket) {
                    scope.viewReservation(item);
                } else {
                    scope.viewTicket(item.TicketNumber.toString());
                }
            }

            scope.viewBillingDocument = (item: ReservationAndTicketHistory): void => {
                if (item.StatusDisplay === "Unfinished") {
                    var url = self.$state.href("estimate", { reservationID: item.ID });
                }
                else {
                    var url = self.$state.href("billing-document", { ticketIdentifier: item.ID });
                }
                window.open(url, "_self");
            }

            scope.deleteReservation = dataItem => {
                var r = confirm("Are you sure to cancel this reservation?");
                if (r) {

                    if (dataItem.IsReservationWithoutTicket) {
                        this.reservationStatusChangeService
                            .changeReservationStatus(dataItem.ID, ReservationStatus.Cancelled)
                            .then((success) => {
                                if (success) {
                                    scope.dataSource.read();
                                }
                            });
                    }
                    else {
                        var command = new CancelTicketCommandDTO();
                        command.ID = dataItem.ID;
                        command.CreatedBy = scope.createdBy;
                        this.valetServiceCommand.doCommand("AirportTicketCommand", command)
                            .then((data) => {
                                scope.dataSource.read();
                            });
                    }
                }
            };

            scope.onClick = dataItem => {
                var item = listview.element.children(`[data-uid='${dataItem.uid}']`);
                listview.select(item);
            };

            var listViewUtils = new ListViewUtils();
            scope.sortOnField = (newSortField: string) => {
                listViewUtils.sortOnField(scope.dataSource, newSortField);
            }               
        };
    };

    angular.module("app.common")
        .directive("reservationHistory",
        [
            "$window", "$state", "$stateParams", "SessionService", "KendoDataSourceService", "ReservationStatusChangeService", "ValetServiceCommand",
            (win, state, stateParams, sessionService, kendoDS, rscSvc, vsc) => new ReservationHistoryDirective(win, state, stateParams, sessionService, kendoDS, rscSvc, vsc)
        ]);
}