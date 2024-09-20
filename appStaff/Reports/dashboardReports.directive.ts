module AppStaff {
    import Data = kendo.data;

    export interface IDashboardReportsAttrs extends ng.IAttributes {
    }

    export interface IDashboardReportsScope extends ng.IScope {
        loadingPromise: ng.IPromise<any>;
        cgBusyConfiguration: any;

        selectedOperatingLocation: OperatingLocationDTO;
        onChangeOperatingLocation(newOperatingLocation: OperatingLocationDTO): void;

        canView: boolean;
        canViewFinancialData: boolean;

        filterFromDateTime: string;
        filterToDateTime: string;      
        applyDateFilter(): void;
        currentDispatchParameters: DispatchParameters;

        ticketData: Array<BillingDocumentQueryResult>;

        dataReservationCreatedBy: kendo.data.DataSource;
        dataActiveTickets: kendo.data.DataSource;
        allCountsData: Array<StringAndNumberDTO>;
        revenueSummaryData: Array<StringAndNumberDTO>;
        estimatedRevenueSummaryData: Array<StringAndNumberDTO>;
        estimatedRevenueSummaryToInfinityData: Array<StringAndNumberDTO>;
        revenueByServiceCategoryData: Array<StringAndTwoNumbersDTO>;
        refundsByCategoryData: Array<StringAndTwoNumbersDTO>;
        parkedPerDayData: Array<StringAndNumberDTO>;

        getReservationCreatedBy(): void;
        getActiveTickets(): void;
        getAllCountsData(): void;
        getRevenueSummaryData(): void;
        getEstimatedRevenueSummaryData(): void;
        getEstimatedRevenueSummaryToInfinityData(): void;
        getRevenueByServiceCategoryData(): void;
        getRefundsByCategoryData(): void;
        getParkedPerDayData(): void;

        detailsRevenue(): void;
        detailsEstimate(): void;
    }

    class DashboardReportsDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "Reports/dashboardReports.directive.html";
        scope = {};

        static $inject = ["SessionService", "AuthService", "KendoDataSourceService", "ReportQuery" ];

        constructor(private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
                    private kendoService: AppCommon.KendoDataSourceService,
                    private reportQuery: AppCommon.ReportQuery) {
        }

        link: ng.IDirectiveLinkFn = (scope: IDashboardReportsScope, elements: ng.IAugmentedJQuery, attrs: IDashboardReportsAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            
            var dispatchAccess = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.dispatch);
            scope.canView = dispatchAccess >= AccessLevel.View;

            var financialAccess = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.financialData);
            scope.canViewFinancialData = financialAccess >= AccessLevel.View;

            var CONTAINER_SIZE = 350;
            var PADDING = 120;
            var LEGEND_SIZE = 0;
            var LEGEND_OFFSET = CONTAINER_SIZE - LEGEND_SIZE;
            var PLOT_WIDTH = CONTAINER_SIZE + PADDING;
            var plotArea = {
                height: LEGEND_OFFSET
            };
            var legend = {
                visible: false,
                position: "custom",
                orientation: "horizontal",
                offsetY: LEGEND_OFFSET
            };
            var seriesClickEvent = function(e) {
                $.each(e.sender.dataSource.view(),
                    function() {
                        // Clean up exploded state
                        this.explode = false;
                    });

                // Disable animations
                e.sender.options.transitions = false;

                // Explode the current slice
                e.dataItem.explode = true;
                e.sender.refresh();
            };

            scope.onChangeOperatingLocation = (newOperatingLocation: OperatingLocationDTO): void => {
                if (newOperatingLocation == null) {
                    scope.selectedOperatingLocation = null;
                    return;
                }
                scope.selectedOperatingLocation = newOperatingLocation;
            };

            scope.applyDateFilter = (): void => {
                if (!!scope.filterFromDateTime && !!scope.filterToDateTime) {

                    scope.ticketData = null;

                    scope.currentDispatchParameters = new DispatchParameters();
                    scope.currentDispatchParameters.OperatingLocationID = scope.selectedOperatingLocation.ID;
                    scope.currentDispatchParameters.FromDateTime = scope.filterFromDateTime;
                    scope.currentDispatchParameters.ToDateTime = scope.filterToDateTime;

                    // Ref guide: http://demos.telerik.com/kendo-ui/pie-charts/angular

                    // retrieve data
                    scope.getReservationCreatedBy();
                    scope.getActiveTickets();
                    scope.getAllCountsData();
                    scope.getRevenueSummaryData();
                    scope.getEstimatedRevenueSummaryData();

                    scope.getEstimatedRevenueSummaryToInfinityData();
                    scope.getRevenueByServiceCategoryData();
                    scope.getRefundsByCategoryData();
                    scope.getParkedPerDayData();
                }
            };

            scope.getReservationCreatedBy = () => {
                scope.dataReservationCreatedBy = self.kendoService.getDataSourceWithDispatchParameters(CommonConfiguration_Routing_ReportRoutes.CountReservationCreatedBy, "", scope.currentDispatchParameters);

                $("#chartReservationCreatedBy").kendoChart({
                    legend: legend,
                    plotArea: plotArea,
                    seriesClick: seriesClickEvent,
                    title: "Reservations created",
                    dataSource: scope.dataReservationCreatedBy,
                    seriesDefaults: {
                        labels: {
                            template: "#= category# - #= kendo.format('{0:N0}', value)# (#= kendo.format('{0:N0}', percentage*100)#%)",
                            visible: true,
                            background: "transparent"
                        },
                    },
                    series: [{
                        type: "pie",
                        field: "Value",
                        categoryField: "Name",
                        explodeField: "explode",
                        padding: PADDING
                    }],
                    tooltip: {
                        visible: false,
                        format: "N0",
                        template: "#= category# - #= kendo.format('{0:N0}', value) (#= kendo.format('{0:N0}', percentage*100)#%)#"
                    },
                    dataBound: function (e) {
                        var view = scope.dataReservationCreatedBy.view();
                        $("#noDataReservationCreatedBy").toggle(view.length === 0);

                        var count = 0;
                        for (var i = 0; i < view.length; i++) {
                            count += view[i].Value;
                        }

                        e.sender.options.title = "Reservations created - " + count;
                    }
                });
            };

            scope.getActiveTickets= () => {
                //scope.dataActiveTickets = self.kendoService.getDataSourceWithDispatchParameters(CommonConfiguration_Routing_ReportRoutes.CountActiveTicket, "", scope.currentDispatchParameters);

                //$("#chartActiveTickets").kendoChart({
                //    legend: legend,
                //    plotArea: plotArea,
                //    seriesClick: seriesClickEvent,
                //    title: "Active",
                //    dataSource: scope.dataActiveTickets,
                //    seriesDefaults: {
                //        labels: {
                //            template: "#= category# - #= kendo.format('{0:N0}', value)# (#= kendo.format('{0:N0}', percentage*100)#%)",
                //            visible: true,
                //            background: "transparent"
                //        },
                //    },
                //    series: [{
                //        type: "pie",
                //        field: "Value",
                //        categoryField: "Name",
                //        explodeField: "explode",
                //        padding: PADDING
                //    }],
                //    tooltip: {
                //        visible: false,
                //        format: "N0",
                //        template: "#= category# - #= kendo.format('{0:N0}', value) (#= kendo.format('{0:N0}', percentage*100)#%)#"
                //    },
                //    dataBound: function (e) {
                //        var view = scope.dataActiveTickets.view();
                //        $("#noDataActiveTickets").toggle(view.length === 0);

                //        var count = 0;
                //        for (var i = 0; i < view.length; i++) {
                //            count += view[i].Value;
                //        }

                //        e.sender.options.title = "Active - " + count;
                //    }
                //});
            };

            scope.getAllCountsData = () => {
                scope.allCountsData = null;
                self.reportQuery.getAllCountsData(scope.currentDispatchParameters).then((data) => {
                    if (!!data) scope.allCountsData = data;
                });
            };

            scope.getRevenueSummaryData = () => {
                scope.revenueSummaryData = null;
                self.reportQuery.getRevenueSummary(scope.currentDispatchParameters).then((data) => {
                    if (!!data) scope.revenueSummaryData = data;
                });
            };
            scope.detailsRevenue = () => {
                self.reportQuery.getRevenueDetails(scope.currentDispatchParameters).then((data) => {
                    if (!!data) scope.ticketData = data;
                });
            };

            scope.getEstimatedRevenueSummaryData = () => {
                scope.estimatedRevenueSummaryData = null;
                self.reportQuery.getEstimatedRevenueSummary(scope.currentDispatchParameters).then((data) => {
                    if (!!data) scope.estimatedRevenueSummaryData = data;
                });
            };
            scope.detailsEstimate = () => {
                self.reportQuery.getEstimatedRevenueDetails(scope.currentDispatchParameters).then((data) => {
                    if (!!data) scope.ticketData = data;
                });
            };

            scope.getEstimatedRevenueSummaryToInfinityData = () => {
                scope.estimatedRevenueSummaryToInfinityData = null;
                self.reportQuery.getEstimatedRevenueSummaryToInfinity(scope.currentDispatchParameters).then((data) => {
                    if (!!data) scope.estimatedRevenueSummaryToInfinityData = data;
                });
            };

            scope.getRevenueByServiceCategoryData = () => {
                scope.revenueByServiceCategoryData = null;
                self.reportQuery.getRevenueByServiceCategory(scope.currentDispatchParameters).then((data) => {
                    if (!!data) scope.revenueByServiceCategoryData = data;
                });
            };

            scope.getRefundsByCategoryData = () => {
                scope.refundsByCategoryData = null;
                self.reportQuery.getRefundsByCategory(scope.currentDispatchParameters).then((data) => {
                    if (!!data) scope.refundsByCategoryData = data;
                });
            };

            scope.getParkedPerDayData = () => {
                scope.parkedPerDayData = null;
                self.reportQuery.getParkedPerDayData(scope.currentDispatchParameters).then((data) => {
                    if (!!data) scope.parkedPerDayData = data;
                });
            };
        };

    }

    angular.module("app.staff")
        .directive("dashboardReports",
        ["SessionService", "AuthService", "KendoDataSourceService", "ReportQuery",
           (s, auth, kds, r) => new DashboardReportsDirective(s, auth, kds, r)]);
}