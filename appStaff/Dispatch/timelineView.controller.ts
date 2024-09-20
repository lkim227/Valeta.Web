module AppStaff {
    export class TimelineController extends AppCommon.ControllerBase {

        canPlace: boolean;
        placementEnabled: boolean;

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
        runnerListOptions: kendo.ui.ListViewOptions;
        runnerDataSource: kendo.data.DataSource;

        // Greeter/Runner dropdowns
        valetListArray: kendo.data.ObservableArray;
        valetListDataSource: kendo.data.DataSource;

        utils: AppCommon.GenericUtils;
        flightUtils: AppCommon.FlightUtils;
        ticketUtils: AppCommon.TicketUtils;

        zones: ZoneDTO[];

        timePickerOptions: any;

        filterFromDateTime: string;
        filterToDateTime: string;

        // tooltips
        ticketWarningServices: string[];
        ticketInfoServices: string[];
        ticketServicesTooltip: string[];
        ticketPendingIssues: any;

        static $inject = ["$state", "$scope", "$rootScope", "$compile", "$q", "AuthService", "SessionService", "SystemConfigurationService", "KendoDataSourceService", "ValetServiceCommand", "dateFilter"];
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
            private dateFilter: ng.IFilterDate) {

            super(authService);

            this.utils = AppCommon.GenericUtils;
            this.flightUtils = AppCommon.FlightUtils;
            this.ticketUtils = AppCommon.TicketUtils;

            this.initializeForm();
        }

        //
        // functions
        //
        initializeForm() {
            this.canPlace = true; // todo: pass can-place into controller
            this.placementEnabled = this.canPlace;

            this.headertemplate = $("#headertemplate").html();
            this.itemtemplate = $("#itemtemplate").html();

            this.initializeSignalRHub();
        }

        configureValetSignalRHub = (hubValet: SignalR.Hub.Proxy): SignalR.Hub.Proxy => {
            hubValet.on("create",
                (data) => {
                    this.runnerDataSource.read();
                    var notification1 = $("#notification").kendoNotification().data("kendoNotification");
                    if (!!notification1) notification1.success("Added #" + data.FriendlyID + " [" + data.Name + "]");
                });
            hubValet.on("update",
                (data) => {
                    this.runnerDataSource.read();
                    var notification1 = $("#notification").kendoNotification().data("kendoNotification");
                    if (!!notification1) notification1.success("Updated #" + data.FriendlyID + " [" + data.Name + "]");
                });
            hubValet.on("destroy",
                (data) => {
                    this.runnerDataSource.read();
                    var notification1 = $("#notification").kendoNotification().data("kendoNotification");
                    if (!!notification1) notification1.success("Removed #" + data.FriendlyID + " [" + data.Name + "]");
                });
            return hubValet;
        };

        initializeSignalRHub() {
            this.connection = AppCommon.TicketUtils.initializeSignalRConnection();
            this.hubTicket = this.connection.createHubProxy("Ticket");
            this.hubTicket = AppCommon.TicketUtils.configureTicketSignalRHub(this.hubTicket, this);
            this.hubValet = this.connection.createHubProxy("Valet");
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

        dispatchRequestReturnProcess = (dataItem: CurrentStateAirportTicketQueryResult) => {
            var command = new DispatchRequestVehicleCommandDTO();
            command.ID = dataItem.ID;
            command.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;
            this.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command);

            dataItem.TicketStatus = TicketStatus.Outgoing;
        };

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
            var groupingField = "DateTimeCustomerMeetsValetGrouping";
            var dispatchParameters = new DispatchParameters();
            dispatchParameters.OperatingLocationID = operatingLocationID;
            dispatchParameters.FromDateTime = this.filterFromDateTime;
            dispatchParameters.ToDateTime = this.filterToDateTime;

            var dataSourceOptions = this.kendoDataSourceService.getSignalrDataSourceWithGrouping(this.hubTicket, this.hubStart, dispatchParameters, groupingField);
            dataSourceOptions.sort = [
                { field: "DateTimeCustomerMeetsValet", dir: "asc" }
                , { field: "ZoneCode", dir: "asc" }
            ];
            var group = dataSourceOptions.group[0];
            group.aggregates = [
                { field: "ID", aggregate: "count" },
                { field: "TravelDirection", aggregate: "sum" }
            ];
            dataSourceOptions.aggregate = [
                { field: groupingField, aggregate: "count" },
                { field: "TravelDirection", aggregate: "sum" }
            ];

            this.ticketDataSource = new kendo.data.DataSource(dataSourceOptions);

            this.ticketListOptions = {
                headerTemplate: this.headertemplate,
                template: this.itemtemplate,
                dataSource: this.ticketDataSource
            };

            this.ticketDataSource.fetch(() => {
                
                // force to rerender grid when OL changes
                this.ticketListView = $("#ticketListView").data("kendoMobileListView");
                if (!!this.ticketListView) {
                    this.ticketWarningServices = [];
                    this.ticketInfoServices = [];
                    this.ticketServicesTooltip = [];
                    this.ticketPendingIssues = {};
                    this.ticketDataSource.data().forEach((ticket: CurrentStateAirportTicketQueryResult) => {
                        var services = this.kendoDataSourceService.getDataSource(ServiceTaskConfiguration_Routing.QueryRoute, ServiceTaskConfiguration_Routing_QueryMethods.GetByTicketNumber, ticket.TicketNumber.toString());
                        var issues = this.kendoDataSourceService.getDataSource(IssueManagementConfiguration_Routing.QueryRoute, IssueManagementConfiguration_Routing_QueryMethods.GetByReference, ticket.TicketNumber.toString());
                        this.ticketWarningServices[ticket.TicketNumber] = "";
                        this.ticketInfoServices[ticket.TicketNumber] = "";
                        this.ticketServicesTooltip[ticket.TicketNumber] = "";
                        services.fetch(() => {
                            var deleted = "";
                            var completed = "";
                            var openServiceFinished = "";
                            var openServiceNotFinished = "";

                            services.data().forEach((s: ServiceTaskQueryResult) => {
                                if (s.ServiceTaskStatus === ServiceTaskStatus.Deleted) {
                                    deleted += s.ServiceName + " (Deleted) <br>";
                                } else if (s.ServiceTaskStatus === ServiceTaskStatus.Completed) {
                                    completed += s.ServiceName + " <br>";
                                } else if (s.ServiceTaskStatus >= ServiceTaskStatus.ServiceFinished) {
                                    openServiceFinished += s.ServiceName + " <br>";
                                } else {
                                    openServiceNotFinished += s.ServiceName + " (NOT DONE) <br>";
                                }
                            });

                            this.$scope.$evalAsync(() => {
                                if (openServiceNotFinished.length > 0 || openServiceFinished.length > 0) {
                                    this.ticketWarningServices[ticket.TicketNumber] = "Pending Services <br>" + openServiceNotFinished + openServiceFinished;
                                }

                                if (completed.length > 0 || deleted.length > 0) {
                                    this.ticketInfoServices[ticket.TicketNumber] = "Completed Services <br>" + completed + deleted;
                                }

                                this.ticketServicesTooltip[ticket.TicketNumber] = this.ticketWarningServices[ticket.TicketNumber] + this.ticketInfoServices[ticket.TicketNumber];
                            });
                        });

                        issues.fetch(() => {
                            var displayTooltip = false;
                            var txtIssuesTooltip = "Open Issues: <br/>";
                            issues.data().forEach((x: IssueQueryResult) => {
                                if (x.Status !== IssueStatus.Completed) {
                                    displayTooltip = true;
                                    txtIssuesTooltip += "<a href='/appStaff/#/issue/" + x.ID + "' title='Click to view more' target='_self'>" + x.Name + "</a> </br>";
                                }
                            });

                            if (displayTooltip) {
                                this.$scope.$evalAsync(() => {
                                    this.ticketPendingIssues[ticket.TicketNumber] = txtIssuesTooltip;
                                });
                            }
                        });
                    });

                    this.ticketListView.setDataSource(this.ticketDataSource);
                    this.ticketListView.refresh();

                    this.ticketListView.wrapper.kendoDropTargetArea({
                        filter: ".runner-wrapper",
                        dragenter: (e) => {
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
                }
            });
        };

        startGettingRunners = (operatingLocationID: string): void => {
            var dispatchParameters = new DispatchParameters();
            dispatchParameters.OperatingLocationID = operatingLocationID;
            dispatchParameters.FromDateTime = this.filterFromDateTime;
            dispatchParameters.ToDateTime = this.filterToDateTime;

            var dataSourceOptions = this.kendoDataSourceService.getSignalrDataSource(
                this.hubValet,
                this.hubStart,
                dispatchParameters,
                "ReadRunner"
            );
            dataSourceOptions.schema.parse = AppCommon.ValetUtils.valetParseFunction;
            dataSourceOptions.sort = [
                { field: "ExtendedFriendlyID", dir: "asc" }
            ];
            this.runnerDataSource = new kendo.data.DataSource(dataSourceOptions);
            this.runnerListOptions =
                {
                    dataSource: this.runnerDataSource
                };
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
        // Drag/Drop Events
        // *******



        // *******
        // Events
        // *******
        showGreeterSelect = (dataItemTicket: any): void => {
            this.valetListDataSource.read()
                .then(() => {
                    this.$scope.$evalAsync(() => {
                        dataItemTicket.hideGreeter = true;
                        dataItemTicket.hideGreeterCombo = false;
                        var elem = $("#greeter" + dataItemTicket.TicketNumber);
                        elem.kendoComboBox({
                            placeholder: "Select Greeter",
                            dataTextField: "ExtendedFriendlyID",
                            dataValueField: "ID",
                            dataSource: this.valetListDataSource,
                            select: e => {
                                var itemValet = e.dataItem;
                                dataItemTicket.GreeterSagaEmployeeID = itemValet.ID;
                                dataItemTicket.GreeterSagaEmployeeFriendlyID = itemValet.ExtendedFriendlyID;
                                dataItemTicket.hideGreeter = false;
                                dataItemTicket.hideGreeterCombo = true;

                                this.assignGreeterToTicket(dataItemTicket);
                            }
                        });
                    });

                });

        };

        removeGreeter = (dataItemTicket: any): void => {
            var response = confirm("Are you sure you want to delete greeter " + dataItemTicket.GreeterSagaEmployeeFriendlyID + " from ticket #" + dataItemTicket.TicketNumber + "?");
            if (response === false) {
                return;
            }
            dataItemTicket.GreeterSagaEmployeeID = null;

            var command = new UnassignSpecificGreeterCommandDTO();
            command.ID = dataItemTicket.ID;
            command.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;
            this.valetServiceCommand.doCommand(ValetConfiguration_Routing.GreeterSagaCommandRoute, command);

            dataItemTicket.hideRunner = false;
            dataItemTicket.hideRunnerCombo = true;
        };

        assignGreeterToTicket = (ticket: CurrentStateAirportTicketQueryResult): void => {
            if (!!ticket && !!ticket.GreeterSagaEmployeeID) {
                var command = new AssignSpecificGreeterCommandDTO();
                command.ID = ticket.ID;
                command.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;
                command.EmployeeID = ticket.GreeterSagaEmployeeID;
                command.EmployeeFriendlyID = ticket.GreeterSagaEmployeeFriendlyID;
                this.valetServiceCommand.doCommand(ValetConfiguration_Routing.GreeterSagaCommandRoute, command);
            }
        };

        showRunnerSelect = (dataItemTicket: any): void => {
            this.valetListDataSource.read()
                .then(() => {
                    this.$scope.$evalAsync(() => {

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
                            }
                        });
                    });
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

        changeDateTimeCustomerMeetsValet = (ticket: CurrentStateAirportTicketQueryResult): void => {
            if (!!ticket) {
                if (!ticket.DateTimeCustomerMeetsValet) {
                    $(`#DateTimeCustomerMeetsValet-${ticket.ID}`).addClass("ticketlistview-danger");
                } else {
                    $(`#DateTimeCustomerMeetsValet-${ticket.ID}`).removeClass("ticketlistview-danger");
                    var response = confirm(`Are you sure you want to change the meet time for #${ticket.TicketNumber}?`);
                    if (response === false) {
                        this.ticketDataSource.read();
                    } else {
                        var command: any;
                        if (ticket.TravelDirection === TravelDirection.FromCustomer) {
                            command = new ChangeIntakeScheduleCommandDTO();
                        } else {
                            command = new ChangeGiveBackScheduleCommandDTO();
                        }
                        command.ID = ticket.ID;
                        command.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;
                        command.Schedule = new ScheduleDTO();
                        command.Schedule.ScheduleDateTime = ticket.DateTimeCustomerMeetsValet;
                        this.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command)
                            .then(() => {
                                this.ticketDataSource.read();
                            });
                    }
                }
            }
        };

        applyDateFilter = (): void => {
            if (!!this.filterFromDateTime && !!this.filterToDateTime) {
                this.startGettingTickets(this.selectedOperatingLocation.ID);
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
        .controller("TimelineController",
        [
            "$state", "$scope", "$rootScope", "$compile", "$q", "AuthService", "SessionService", "SystemConfigurationService", "KendoDataSourceService", "ValetServiceCommand", "dateFilter",
            (state, scope, rs, com, q, auth, s, c, k, vs, d) => new TimelineController(state, scope, rs, com, q, auth, s, c, k, vs, d)
        ]);
}