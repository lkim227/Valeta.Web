module AppStaff {
    export interface IClosedAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IClosedScope extends ng.IScope {
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

        grid: kendo.ui.Grid;
        gridOptions: any;
        ticketDataSource: kendo.data.DataSource;
        startGettingTickets(): void;

        filterFromDateTime: string;
        filterToDateTime: string;
        applyDateFilter(): void;
    }

    class ClosedDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaff.ConfigureRoutesForDispatchContext.closedTemplateUrl;
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

        link: ng.IDirectiveLinkFn = (scope: IClosedScope, elements: ng.IAugmentedJQuery, attrs: IClosedAttrs, ngModelCtrl: ng.INgModelController) => {
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
                scope.hubTicket = scope.connection.createHubProxy("TicketClosed");
                scope.hubTicket = AppCommon.TicketUtils.configureTicketSignalRHub(scope.hubTicket);
                
                scope.hubStart = scope.connection.start({ jsonp: true })
                    .then(() => {
                         // complete some stuff here...
                     });
            }

            scope.startGettingTickets = (): void => {
                var dispatchParameters = new DispatchParameters();
                dispatchParameters.OperatingLocationID = scope.selectedOperatingLocation.ID;
                dispatchParameters.FromDateTime = scope.filterFromDateTime;
                dispatchParameters.ToDateTime = scope.filterToDateTime;

                //build datasource
                var ticketDataSourceOptions = self.kendoDataSourceService.getSignalrDataSource(
                    scope.hubTicket,
                    scope.hubStart,
                    dispatchParameters
                );
                scope.ticketDataSource = new kendo.data.DataSource(ticketDataSourceOptions);

                //uses TwoStateTicket

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
                        template: '<a class="link" href="/appStaff/\\#/ticket/#=TicketNumber#" target="_self">#=TicketNumber#</a>'
                    },
                    {
                        field: "Customer.AccountID", title: "Customer",
                        template: '<a class="link" href="/appStaff/\\#/customer/#=Customer.AccountID#" target="_self">#=Customer.Name.FriendlyName#</a>'
                    },
                    {
                        field: "ActiveAirportMeet.IntakeDateTimeCustomerMeetsValet",
                        title: "Intake",
                        template: "#= kendo.toString(kendo.parseDate(ActiveAirportMeet.IntakeDateTimeCustomerMeetsValet), \"g\") #"
                    },
                    {
                        field: "ActiveAirportMeet.GiveBackDateTimeCustomerMeetsValet",
                        title: "Give Back",
                        template: "#= kendo.toString(kendo.parseDate(ActiveAirportMeet.GiveBackDateTimeCustomerMeetsValet), \"g\") #"
                    },
                    { field: "Vehicle.FriendlyName", title: "Vehicle", editable: false },
                    { field: "Vehicle.LicensePlate", title: "License Plate", editable: false },
                    { field: "ReservationNote", title: "Reservation Note" },
                    { field: "OfficeNote", title: "Office Note" }
                    //{
                    //    field: "PaymentStatus", title: "Payment Status",
                    //    template: "#=AppCommon.EnumUtils.paymentStatusToTitle(PaymentStatus)#"
                    //}
                ];
                scope.gridOptions = AppCommon.KendoFunctions.getGridOptions(
                    scope.ticketDataSource,
                    "Closed",
                    scope.canCreate,
                    scope.canUpdate,
                    filterable,
                    columns);

                scope.ticketDataSource.fetch(() => {
                    scope.grid = $("#gridClosed").data("kendoGrid");
                    scope.grid.setDataSource(scope.ticketDataSource);
                    scope.grid.refresh();
                });
            }
                
            scope.onChangeOperatingLocation = (newOperatingLocation: OperatingLocationDTO): void => {

                scope.selectedOperatingLocation = newOperatingLocation;

                if (scope.selectedOperatingLocation == null || typeof scope.selectedOperatingLocation == "undefined") return;

                scope.startGettingTickets();
            };

            // ***
            // Button Commands
            // ***
            scope.refreshData = (): void => {
                scope.$evalAsync(() => {
                    scope.startGettingTickets();
                });
            };

            scope.navigateTo = (state: string): void => {
                self.$state.go(state, null, { 'reload': true });
            };
            
            scope.applyDateFilter = (): void => {
                if (!!scope.filterFromDateTime && !!scope.filterToDateTime) {
                    scope.refreshData();
                }
            };

            // 
            // Body
            //
            initializeSignalRHub();
        };
    }

    angular.module("app.staff")
        .directive("closed",
        ["$state", "$rootScope", "SessionService", "AuthService", "ValetServiceCommand", "KendoDataSourceService",
            (st, s, rs, auth, vsc, k) => new ClosedDirective(st, s, rs, auth, vsc, k)]);
}