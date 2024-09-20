module AppStaff {
    export interface ITimesheetAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface ITimesheetScope extends ng.IScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        accessLevel: AccessLevel;
        hasEditAccess: boolean;    

        selectedOperatingLocationID: string;
        selectedTimesheet: string;   
       
        filterFromDateTime: any;
        filterToDateTime: any;

        gridOptions: any;
        buildKendoGrid(): void;
        timesheetsDataSource: kendo.data.DataSource;

        printWorkingHours(hours: number): string;
        printWorkingDay(date: string): string;
        onSearch(): void;
        toggleTimeDetails(t: TimesheetQueryResult): void;
        onChangeOperatingLocation(selectedOL: OperatingLocationDTO): void;
        getNameForOperatingLocationID(operatingLocationId: string): void;
    }

    class TimesheetDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.employeeTimesheetAdminTemplateUrl;
        scope = {
        
        };

        static $inject = ["SessionService", "AuthService", "TimesheetQueryRepository", "OperatingLocationRepository", "dateFilter"];

        constructor(private sessionService: AppCommon.SessionService,
                    private authService: AppCommon.AuthService,
                    private timesheetQueryRepository: TimesheetQueryRepository,
                    private operatingLocationRepository: AppCommon.OperatingLocationRepository,
                    private dateFilter: ng.IFilterDate) {
        }

        link: ng.IDirectiveLinkFn = (scope: ITimesheetScope, elements: ng.IAugmentedJQuery, attrs: ITimesheetAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.employees);
            scope.hasEditAccess = scope.accessLevel >= AccessLevel.Edit;

            scope.canCreate = getBooleanAttribute(attrs.canCreate) && scope.hasEditAccess;
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate);
            scope.canDelete = getBooleanAttribute(attrs.canDelete);

            var now = new Date(); // initial filtered datetimes (last 30 days)
            scope.filterToDateTime = now;
            scope.filterFromDateTime = new Date(new Date().setMonth(now.getMonth() - 1));
            scope.selectedOperatingLocationID = null;

            scope.onSearch = (): void => {
                // render grid with custom filters applied
                var filterData = {
                    fromDate: Date.parse(scope.filterFromDateTime),
                    toDate: Date.parse(scope.filterToDateTime),
                    operatingLocationId: scope.selectedOperatingLocationID || "null"
                };
                scope.timesheetsDataSource.read(filterData);
            };

            scope.onChangeOperatingLocation = (selectedOL: OperatingLocationDTO): void => {
                if (selectedOL == null) {
                    scope.selectedOperatingLocationID = null;
                    return;
                }

                scope.selectedOperatingLocationID = selectedOL.ID;

                scope.onSearch(); 
            };

            scope.buildKendoGrid = () => {
                var schema = {
                    model: {
                        id: "ID",
                        fields: {
                            ID: { editable: false },
                            EmployeeFriendlyID: { editable: false },
                            OperatingLocationID: { editable: false },
                            TotalHours: { editable: false },
                            TimesheetStatus: { editable: false }
                        }
                    }
                };

                var readCommand = {
                    url: options => ((!!options.fromDate && !!options.toDate)
                                        ? AppConfig.APIHOST + "Timesheet/GetSummaryBetweenDates?fromDate=" + options.fromDate + "&toDate=" + options.toDate + "&operatingLocationId=" + options.operatingLocationId
                                        : AppConfig.APIHOST + "Timesheet/GetSummaryBetweenDates?fromDate=" + Date.parse(scope.filterFromDateTime) + "&toDate=" + Date.parse(scope.filterToDateTime) + "&operatingLocationId=" + scope.selectedOperatingLocationID),
                    type: "get",
                    dataType: "json",
                    beforeSend: req => {
                        req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                    }
                };

                scope.timesheetsDataSource = AppCommon.KendoDataSourceFactory.createKendoDataSource("Timesheet", schema, null, readCommand);

                //build grid
                var filterable = "false";
                var columns = [
                    {
                        field: "ID",
                        hidden: true,
                        editable: false
                    },
                    {
                        field: "EmployeeFriendlyID",
                        title: "Employee",
                        width: "200px",
                        editable: false
                    },
                    {
                        field: "OperatingLocationID",
                        title: "Operating Location",
                        //template: "<div> {{ getNameForOperatingLocationID(dataItem.OperatingLocationID) }} </div>",
                        hidden: true,
                        editable: false
                    },
                    {
                        field: "TotalHours",
                        title: "Total Hours",
                        template: `<div> {{ printWorkingHours(dataItem.TotalHours) }} </div>
                                   <div ng-show="selectedTimesheet == dataItem.ID">
                                      <div ng-repeat="detail in dataItem.HoursPerDay">
                                         <p ng-bind-html="printWorkingDay(detail)"></p>
                                      </div>
                                   </div>`,
                        width: "400px",
                        editable: false
                    },
                    {
                        field: "TimesheetStatus",
                        title: "Status",
                        template: "<div> #= AppCommon.EnumUtils.getNameForTimesheetStatus(TimesheetStatus) # </div>",
                        width: "300px",
                        editable: false
                    },
                    {
                        field: "ID",
                        title: "Actions",
                        template: `<div>
                                     <button class="btn btn-primary" ng-click="toggleTimeDetails(dataItem)">
                                        <em class="glyphicon glyphicon-list-alt" > </em>
                                        {{ selectedTimesheet == dataItem.ID  ?  'Collapse'  :  'View more details' }}
                                      </button> 
                                  </div>`,
                        width: "300px",
                        filterable: false,
                        editable: false
                    }
                ];
                scope.gridOptions = AppCommon.KendoFunctions.getGridOptions(
                    scope.timesheetsDataSource,
                    "Timesheet",
                    false,
                    false,
                    filterable,
                    columns);    
            };

            scope.toggleTimeDetails = (t: TimesheetQueryResult): void => {
                if (scope.selectedTimesheet == t.ID)
                    scope.selectedTimesheet = null;
                else
                    scope.selectedTimesheet = t.ID;
            };

            scope.printWorkingHours = (hours: number): string => {
                var onlyHours = Math.floor(hours);
                var onlyMinutes = Math.round((hours % 1) * 60);
                var formatted = onlyHours + "hs " + onlyMinutes + " min";
                return formatted;
            };

            scope.printWorkingDay = (detail: any): string => {
                var dayOfWeek = new Date(detail.Key).toString().substring(0, 3); // getDay()
                var formatted = "<b> - " + dayOfWeek + " (" + detail.Key + ") : </b>" + scope.printWorkingHours(detail.Value);
                return formatted;
            };

            scope.getNameForOperatingLocationID = (operatingLocationID: string) => {
                self.operatingLocationRepository.getByID(operatingLocationID, AppConfig.APIHOST)
                    .then(data => {
                        if (!!data) {
                            scope.$evalAsync(() => { return data.Name.toString(); });
                        } else {
                            scope.$evalAsync(() => { return "---"; });
                        }
                    });
            };

           
            // init data table without custom filters
            scope.buildKendoGrid();
        };

    }

    angular.module("app.staff")
        .directive("timesheet",
        ["SessionService", "AuthService", "TimesheetQueryRepository", "OperatingLocationRepository", "dateFilter",
            (s, a, ts, ol, d) => new TimesheetDirective(s, a, ts, ol, d)
        ]);
}