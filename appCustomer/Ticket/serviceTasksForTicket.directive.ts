module AppCustomer {

    export interface IServiceTasksForTicketScope extends AppCommon.IListViewDirectiveBaseScope {
        ticketNumberParam: number;
        selectedTicket: AirportTicketQueryResult;
        
        formMessages: any;
        genericUtils: AppCommon.GenericUtils;
        enumUtils: AppCommon.EnumUtils;
 }

    class ServiceTasksForTicketDirective extends AppCommon.ListViewDirectiveBase {
        restrict = "E";
        templateUrl = "/appCustomer/Ticket/ServiceTasksForTicket.directive.html";
        scope = {
            selectedTicket: "="
        };

        static $inject = ["$stateParams", "SessionService", "KendoDataSourceService", "DispatcherAirportTicketQuery"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private kendoDataSourceService: AppCommon.KendoDataSourceService,
            private ticketRepository: AppCommon.DispatcherAirportTicketQuery
        ) {
            super();
        }

        link: ng.IDirectiveLinkFn = (scope: IServiceTasksForTicketScope, elements: ng.IAugmentedJQuery, attrs: AppCommon.IListViewDirectiveBaseAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.genericUtils = AppCommon.GenericUtils;
            scope.enumUtils = AppCommon.EnumUtils;
            scope.formMessages = AppCommon.FormMessages;

            scope.ticketNumberParam = this.$stateParams["ticketNumber"];


            var listview = $("#listView").data("kendoListView");

            self.initializeScope(scope, attrs);
            //console.log(self.sessionService.userInfo.customerAccountID);

            scope.dataSource = self.kendoDataSourceService.getDataSource(ServiceTaskConfiguration_Routing.QueryRoute, ServiceTaskConfiguration_Routing_QueryMethods.GetByTicketNumber, scope.ticketNumberParam.toString());
            scope.dataSource.sort([
                { field: "ServiceName", dir: "asc" }
            ]);
            scope.dataSource.fetch(() => {          //manually fetch so we can control changing state if need be
                var recordCount = scope.dataSource.total();
                if (recordCount === 0) {
                    // 
                } else {
                    listview.setDataSource(scope.dataSource);
                    listview.refresh();
                }
            });
        };

    }

    angular.module("app.customer")
        .directive("serviceTasksForTicket",
        [
            "$stateParams", "SessionService", "KendoDataSourceService", "DispatcherAirportTicketQuery",
            (sp, s, k, d) => new ServiceTasksForTicketDirective(sp, s, k, d)
        ]);
}