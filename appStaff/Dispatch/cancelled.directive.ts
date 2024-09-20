module AppStaff {
    export interface ICancelledAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface ICancelledScope extends ng.IScope {
        selectedOperatingLocation: OperatingLocationDTO;
        onChangeOperatingLocation(newOperatingLocation: OperatingLocationDTO): void;

        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        accessLevel: AccessLevel;
        hasEditAccess: boolean;
        editType: string;

        formMessages: any;
        utils: AppCommon.GenericUtils;
        enumUtils: AppCommon.EnumUtils;

        connection: SignalR.Hub.Connection;
        hubTicket: SignalR.Hub.Proxy;
        refreshData(): void;
        navigateTo(state: string): void;
        hubStart: any;
        ticketDataSource: kendo.data.DataSource;

        gridOptions: any;

        dispatchRequestReturnProcess(dataItem: any): void;
    }

    class CancelledDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaff.ConfigureRoutesForDispatchContext.cancelledTemplateUrl;
        scope = {

        };

        static $inject = ["$state", "$rootScope", "SessionService", "AuthService", "ValetServiceCommand", "KendoDataSourceService"];

        constructor(
            private $state: ng.ui.IStateService,
            private $rootScope: ng.IRootScopeService,
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private valetServiceCommand: AppCommon.ValetServiceCommand,
            private kendoDataSourceService: AppCommon.KendoDataSourceService) {
        }

        link: ng.IDirectiveLinkFn = (scope: ICancelledScope, elements: ng.IAugmentedJQuery, attrs: ICancelledAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;
            scope.utils = AppCommon.GenericUtils;
            scope.enumUtils = AppCommon.EnumUtils;

            scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.dispatch);
            scope.hasEditAccess = scope.accessLevel >= AccessLevel.Edit;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canCreate = getBooleanAttribute(attrs.canCreate) && scope.hasEditAccess;
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate) && scope.hasEditAccess;
            scope.canDelete = getBooleanAttribute(attrs.canDelete);

            
            scope.editType = "false";

            var initializeSignalRHub = () => {
                scope.connection = AppCommon.TicketUtils.initializeSignalRConnection();
                scope.hubTicket = scope.connection.createHubProxy("TicketCancelled");
                scope.hubTicket = AppCommon.TicketUtils.configureTicketSignalRHubNotDateFiltered(scope.hubTicket);
                
                scope.hubStart = scope.connection.start({ jsonp: true })
                    .then(() => {
                         // complete some stuff here...
                     });
            }
            
            scope.onChangeOperatingLocation = (newOperatingLocation: OperatingLocationDTO): void => {

                scope.selectedOperatingLocation = newOperatingLocation;

                if (scope.selectedOperatingLocation == null || typeof scope.selectedOperatingLocation == "undefined") return;

                var dispatchParameters = new DispatchParameters();
                dispatchParameters.OperatingLocationID = scope.selectedOperatingLocation.ID;

                //build datasource
                var ticketDataSourceOptions = self.kendoDataSourceService.getSignalrDataSource(
                    scope.hubTicket,
                    scope.hubStart,
                    dispatchParameters
                );
                scope.ticketDataSource = new kendo.data.DataSource(ticketDataSourceOptions);
                scope.ticketDataSource.sort([
                    { field: "TicketStatus", dir: "asc" }
                ]);

                //build grid
                var filterable = "true";
                var columns = [
                    { field: "ID", hidden: true },
                    {
                        field: "TicketStatus", title: "Status",
                        template: "#=AppCommon.TicketUtils.ticketStatusToTitle(TicketStatus) #"
                    },
                    {
                        field: "TicketNumber", title: "Ticket #", editable: false,
                        template: '<a class="link" href="/appStaff/\\#/ticket/#=TicketNumber#" target="_self">#=TicketNumber#</a><br/>'
                    },
                    {
                        field: "CustomerID", title: "Customer",
                        template: '<a class="link" href="/appStaff/\\#/customer/#=CustomerID#" target="_self">#=CustomerName#</a>'
                    },
                    //{
                    //    field: "ActiveAirportMeet.IntakeDateTimeCustomerMeetsValet",
                    //    title: "Intake",
                    //    template: "#= kendo.toString(kendo.parseDate(ActiveAirportMeet.IntakeDateTimeCustomerMeetsValet), \"g\") #"
                    //},
                    //{
                    //    field: "ActiveAirportMeet.GiveBackDateTimeCustomerMeetsValet",
                    //    title: "Give Back",
                    //    template: "#= kendo.toString(kendo.parseDate(ActiveAirportMeet.GiveBackDateTimeCustomerMeetsValet), \"g\") #"
                    //},
                    { field: "Vehicle.FriendlyName", title: "Vehicle", editable: false },
                    { field: "Vehicle.LicensePlate", title: "License Plate", editable: false }
                    //{
                    //    title: "",
                    //    template: `<div ng-hide="!hasEditAccess">
                    //            <button ng-hide="dataItem.TicketStatus===6" class="btn btn-primary" ng-click="dispatchRequestReturnProcess(dataItem)">
                    //                Return to Customer
                    //            </button>
                    //          </div>`,
                    //    width: "150px",
                    //    editable: false,
                    //    filterable: false,
                    //    hidden: !scope.hasEditAccess
                    //}
                ];
                scope.gridOptions = AppCommon.KendoFunctions.getGridOptions(
                    scope.ticketDataSource,
                    "Cancelled",
                    scope.canCreate,
                    scope.canUpdate,
                    filterable,
                    columns);
            };

            // ***
            // Button Commands
            // ***
            scope.refreshData = (): void => {
                scope.$evalAsync(() => {
                    scope.ticketDataSource.read();
                });
            };

            scope.navigateTo = (state: string): void => {
                self.$state.go(state, null, { 'reload': true });
            };

            // 
            // Body
            //
            initializeSignalRHub();
        };
    }

    angular.module("app.staff")
        .directive("cancelled",
        ["$state", "$rootScope", "SessionService", "AuthService", "ValetServiceCommand", "KendoDataSourceService",
            (st, s, rs, auth, vsc, k) => new CancelledDirective(st, s, rs, auth, vsc, k)]);
}