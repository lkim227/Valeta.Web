module AppStaff {
    export class TimelineAllController extends AppCommon.ControllerBase {
        headertemplate: any;
        itemtemplate: any;

        selectedOperatingLocation: OperatingLocationDTO;
        loadingPromise: ng.IPromise<any>;

        ticketListView: kendo.mobile.ui.ListView;
        ticketListOptions: kendo.mobile.ui.ListViewOptions;
        ticketDataSource: kendo.data.DataSource;

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
            this.headertemplate = $("#headertemplate").html();
            this.itemtemplate = $("#itemtemplate").html();
        }

        onChangeOperatingLocation = (newOperatingLocation: OperatingLocationDTO): void => {
            if (newOperatingLocation == null) {
                this.selectedOperatingLocation = null;
                return;
            }
            this.selectedOperatingLocation = newOperatingLocation;

            this.getTickets(this.selectedOperatingLocation.ID);
        };

        getTickets = (operatingLocationID: string): void => {
            var deferred = this.$q.defer();
            this.loadingPromise = deferred.promise;

            var groupingField = "DateTimeCustomerMeetsValetGrouping";
            var dispatchParameters = new DispatchParameters();
            dispatchParameters.OperatingLocationID = operatingLocationID;
            dispatchParameters.FromDateTime = this.filterFromDateTime;
            dispatchParameters.ToDateTime = this.filterToDateTime;

            var dataSourceOptions = this.kendoDataSourceService.getDataSourceOptionsWithGrouping(
                ValetConfiguration_Routing.DispatcherAirportTicketRoute,
                ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetAllIntakeAndGiveBackByOperatingLocationAndDateTimeFilter,
                dispatchParameters,
                groupingField);
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
                deferred.resolve();

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
                }
            });
        };



        applyDateFilter = (): void => {
            if (!!this.filterFromDateTime && !!this.filterToDateTime) {
                this.getTickets(this.selectedOperatingLocation.ID);
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
        };
    }

    angular.module("app.staff")
        .controller("TimelineAllController",
        [
            "$state", "$scope", "$rootScope", "$compile", "$q", "AuthService", "SessionService", "SystemConfigurationService", "KendoDataSourceService", "ValetServiceCommand", "dateFilter",
            (state, scope, rs, com, q, auth, s, c, k, vs, d) => new TimelineAllController(state, scope, rs, com, q, auth, s, c, k, vs, d)
        ]);
}