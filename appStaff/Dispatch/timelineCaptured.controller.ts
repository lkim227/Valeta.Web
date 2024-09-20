module AppStaff {
    export class TimelineCapturedController extends AppCommon.ControllerBase {

        canPlace: boolean;
        placementEnabled: boolean;
        canClearDemoData: boolean;

        headertemplate: any;
        itemtemplate: any;
        adHocCommunicationUrl = AppCommon.CommunicationUtils.buildAdHocCommunicationUrl(AppCommon.CommunicationUtils.referenceContextTicket);

        selectedOperatingLocation: OperatingLocationDTO;

        connection: SignalR.Hub.Connection;
        hubTicket: SignalR.Hub.Proxy;
        hubValet: SignalR.Hub.Proxy;
        hubStart: any;

        loadingPromise: ng.IPromise<any>;

        ticketListView: kendo.mobile.ui.ListView;
        ticketListOptions: kendo.mobile.ui.ListViewOptions;
        ticketDataSource: kendo.data.DataSource;

        // Runners pane
        runnerListView: kendo.ui.ListView;
        runnerDataSource: kendo.data.DataSource;

        // Greeter/Runner dropdowns
        valetListArray: kendo.data.ObservableArray;
        valetListDataSource: kendo.data.DataSource;

        utils: AppCommon.GenericUtils;
        flightUtils: AppCommon.FlightUtils;
        ticketUtils: AppCommon.TicketUtils;

        timePickerOptions: any;

        static $inject = ["$state", "$scope", "$rootScope", "$compile", "$q", "AuthService", "SessionService", "SystemConfigurationService", "KendoDataSourceService", "ValetServiceCommand", "DispatcherAirportTicketQuery", "DemoService"];
        constructor(
            private $state: ng.ui.IStateService,
            private $scope: ng.IScope,
            private $rootScope: ng.IRootScopeService,
            private $compile: ng.ICompileService,
            private $q: ng.IQService,
            private authService: AppCommon.AuthService,
            private sessionService: AppCommon.SessionService,
            private systemConfigurationService: AppCommon.SystemConfigurationService,
            private kendoDataSourceService: AppCommon.KendoDataSourceService,
            private valetServiceCommand: AppCommon.ValetServiceCommand,
            private dispatcherAirportTicketQuery: AppCommon.DispatcherAirportTicketQuery,
            private demoService: AppCommon.DemoService) {

            super(authService);

            this.utils = AppCommon.GenericUtils;
            this.flightUtils = AppCommon.FlightUtils;
            this.ticketUtils = AppCommon.TicketUtils;

            this.initializeForm();
        }

        //
        // functions
        //
        clearDemoData() {
            this.demoService.clearDemoData()
                .then((success) => {
                    if (success) window.alert("Ticket data is cleared.");
                });
        }

        initializeForm() {
            this.canPlace = true; // todo: pass can-place into controller
            this.placementEnabled = this.canPlace;
            var systemSetupRight = this.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.systemSetup);
            this.canClearDemoData = systemSetupRight >= AccessLevel.Edit;

            this.headertemplate = $("#headertemplate").html();
            this.itemtemplate = $("#itemtemplate").html();

            this.initializeSignalRHub();
        }

        configureValetSignalRHub = (hubValet: SignalR.Hub.Proxy): SignalR.Hub.Proxy => {
            hubValet.on("create",
                (data) => {
                    this.runnerDataSource.read();
                    var notification1 = $("#notification").kendoNotification().data("kendoNotification");
                    if (!!notification1) notification1.success("Runner " + data.FriendlyID + " is available");
                });
            hubValet.on("update",
                (data) => {
                    this.runnerDataSource.read();
                    var notification1 = $("#notification").kendoNotification().data("kendoNotification");
                    if (!!notification1) notification1.success("Updated #" + data.FriendlyID + " [" + data.Name + "]");
                });
            hubValet.on("destroy",
                (data) => {
                    //this.runnerDataSource.read();
                    var notification1 = $("#notification").kendoNotification().data("kendoNotification");
                    if (!!notification1) notification1.success("Runner " + data.FriendlyID + " is assigned");
                });
            return hubValet;
        }

        initializeSignalRHub() {
            this.connection = AppCommon.TicketUtils.initializeSignalRConnection();
            this.hubTicket = this.connection.createHubProxy("TicketCaptured");
            this.hubTicket = AppCommon.TicketUtils.configureTicketSignalRHubNotDateFiltered(this.hubTicket);
            this.hubValet = this.connection.createHubProxy("RunnerAvailable");
            this.hubValet = this.configureValetSignalRHub(this.hubValet);

            this.hubStart = this.connection.start({ jsonp: true })
                .then(() => {
                    this.timePickerOptions = {
                        parseFormats: [AppCommon.AppCommonConfig.timePickerOptionsParseFormat],
                        format: AppCommon.AppCommonConfig.timePickerOptionsFormat,
                        interval: AppCommon.AppCommonConfig.timePickerOptionsInterval
                    };
                });
        }


        onChangeOperatingLocation = (newOperatingLocation: OperatingLocationDTO): void => {
            if (newOperatingLocation == null) {
                this.selectedOperatingLocation = null;
                return;
            }
            this.selectedOperatingLocation = newOperatingLocation;

            this.startGettingTickets(this.selectedOperatingLocation.ID);
            this.startGettingRunners(this.selectedOperatingLocation.ID);

            //setup valetListDataSource
            this.valetListDataSource = this.kendoDataSourceService.getDataSource(
                ValetConfiguration_Routing.ValetRoute,
                ValetConfiguration_Routing_ValetMethods.GetValetsOnShiftByOperatingLocationID,
                this.selectedOperatingLocation.ID,
                null,
                null,
                AppCommon.ValetUtils.valetParseFunction);
        };

        startGettingTickets = (operatingLocationID: string): void => {
            var deferred = this.$q.defer();
            this.loadingPromise = deferred.promise;

            var groupingField = "DateTimeCustomerMeetsValetGrouping";
            var dispatchParameters = new DispatchParameters();
            dispatchParameters.OperatingLocationID = operatingLocationID;

            var dataSourceOptions = this.kendoDataSourceService.getSignalrDataSourceWithGrouping(
                this.hubTicket,
                this.hubStart,
                dispatchParameters,
                groupingField);

            dataSourceOptions.schema.parse = (response) => {
                $.each(response, (idx, elem) => {
                    elem.UseTollTagSingleTicketCount = (elem.UseTollTag ? 1 : 0);
                });
                return response;
            };
            dataSourceOptions.sort = [
                { field: "DateTimeCustomerMeetsValet", dir: "asc" },
                { field: "ZoneCode", dir: "asc" }
            ];
            var group = dataSourceOptions.group[0];
            group.aggregates = [
                { field: "ID", aggregate: "count" },
                { field: "UseTollTagSingleTicketCount", aggregate: "sum" }
            ];
            dataSourceOptions.aggregate = [
                { field: groupingField, aggregate: "count" },
                { field: "UseTollTagSingleTicketCount", aggregate: "sum" }
            ];

            this.ticketDataSource = new kendo.data.DataSource(dataSourceOptions);
            this.ticketListOptions = {
                headerTemplate: this.headertemplate,
                template: this.itemtemplate,
                dataSource: this.ticketDataSource
            };

            this.ticketDataSource.fetch(() => {
                deferred.resolve();

                // force to rerender grid when OL changes
                this.ticketListView = $("#ticketListView").data("kendoMobileListView");
                this.ticketListView.setDataSource(this.ticketDataSource);
                this.ticketListView.refresh();

                this.ticketListView.wrapper.kendoDropTargetArea({
                    filter: ".runner-wrapper",
                    dragenter: (e) =>{
                        e.dropTarget.addClass("dropzone-hover");
                    },
                    dragleave: (e) => {
                        e.dropTarget.removeClass("dropzone-hover");
                    },
                    drop: (e) => {
                        e.dropTarget.removeClass("dropzone-hover");

                        var dataItemValet: any = this.runnerDataSource
                            .getByUid(e.draggable.currentTarget.attr("data-uid"));
                        var dataItemTicket: any = this.ticketDataSource
                            .getByUid(e.dropTarget.closest("li").attr("data-uid"));

                        this.assignRunnerToTicket(dataItemValet, dataItemTicket);
                        this.$scope.$apply();
                    }
                });
            });
        };

        startGettingRunners = (operatingLocationID: string): void => {
            var dispatchParameters = new DispatchParameters();
            dispatchParameters.OperatingLocationID = operatingLocationID;

            var dataSourceOptions = this.kendoDataSourceService.getSignalrDataSource(
                this.hubValet,
                this.hubStart,
                dispatchParameters
            );
            dataSourceOptions.schema.parse = AppCommon.ValetUtils.valetParseFunction;
            dataSourceOptions.sort = [
                { field: "ExtendedFriendlyID", dir: "asc" }
            ];
            this.runnerDataSource = new kendo.data.DataSource(dataSourceOptions);

            this.runnerDataSource.fetch(() => {
                // force to rerender grid when OL changes
                this.runnerListView = $("#runnerListView").data("kendoListView");
                if (!!this.runnerListView) {
                    this.runnerListView.setDataSource(this.runnerDataSource);
                    this.runnerListView.refresh();

                    $(this.runnerListView.element)
                        .kendoDraggable({
                            filter: ".draggable",
                            dragstart: (e) => {

                            },
                            hint: (e) => {
                                return $(e).find(".valet-element").clone().addClass("dragging").removeClass("width-full");
                            },
                            cancelHold: null
                        });
                }
            });
        };

        // *******
        // Events  
        // *******
        showRunnerSelect = (dataItemTicket: any): void => {
            dataItemTicket.hideRunner = true;
            dataItemTicket.hideRunnerCombo = false;
            var elem = $("#runner" + dataItemTicket.TicketNumber);
            elem.kendoComboBox({
                placeholder: "Select Runner",
                dataTextField: "ExtendedFriendlyID",
                dataValueField: "ID",
                dataSource: this.valetListDataSource,
                select: e => {
                    this.assignRunnerToTicket(e.dataItem, dataItemTicket);
                    this.$scope.$apply();
                }
            });
        };

        removeRunner = (dataItemTicket: any): void => {
            var response = confirm("Are you sure you want to unassign runner " + dataItemTicket.RunnerSagaEmployeeFriendlyID + " from ticket #" + dataItemTicket.TicketNumber + "?");
            if (response === false) {
                return;
            }

            var command = new UnassignRunnerCommandDTO();
            command.ID = dataItemTicket.ID;
            command.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;
            command.RemovedEmployeeID = dataItemTicket.RunnerSagaEmployeeID;
            this.valetServiceCommand.doCommand(ValetConfiguration_Routing.RunnerSagaCommandRoute, command);
            //this.$scope.$apply();

            dataItemTicket.RunnerSagaEmployeeID = null;
            dataItemTicket.hideRunner = false;
            dataItemTicket.hideRunnerCombo = true;
        };

        assignRunnerToTicket = (valet: any, ticket: CurrentStateAirportTicketQueryResult): void => {
            if (!!ticket && !!valet && !!valet.ID) {
                var dataItemTicket: any = ticket;
                dataItemTicket.RunnerSagaEmployeeID = valet.ID;
                dataItemTicket.RunnerSagaEmployeeFriendlyID = valet.ExtendedFriendlyID;
                dataItemTicket.RunnerSagaStatus = null;
                dataItemTicket.hideRunner = false;
                dataItemTicket.hideRunnerCombo = true;
                var command = AppCommon.TicketUtils.constructAssignRunnerCommand(dataItemTicket.ID, dataItemTicket.RunnerSagaEmployeeID, dataItemTicket.RunnerSagaEmployeeFriendlyID, this.sessionService.userInfo.employeeFriendlyID);
                this.valetServiceCommand.doCommand(ValetConfiguration_Routing.RunnerSagaCommandRoute, command);
            }
        };

        refreshData = (): void => {
            var deferred = this.$q.defer();
            this.loadingPromise = deferred.promise;

            this.ticketDataSource.read()
                .then(() => deferred.resolve());

            if (!!this.ticketListView) {  
                this.ticketListView.refresh();
            }
            this.runnerDataSource.read();
            if (!!this.runnerListView) {
                this.runnerListView.refresh();
            }
            this.valetListDataSource.read();
        };
    }

    angular.module("app.staff")
        .controller("TimelineCapturedController",
        [
            "$state", "$scope", "$rootScope", "$compile", "$q", "AuthService", "SessionService", "SystemConfigurationService", "KendoDataSourceService", "ValetServiceCommand", "DispatcherAirportTicketQuery", "DemoService",
            (state, scope, rs, com, q, auth, s, c, k, vs, dt, demo) => new TimelineCapturedController(state, scope, rs, com, q, auth, s, c, k, vs, dt, demo)
        ]);
}