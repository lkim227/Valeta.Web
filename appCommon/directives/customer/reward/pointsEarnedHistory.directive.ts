module AppCommon {

    export interface IPointsEarnedHistoryScope extends AppCommon.IListViewDirectiveBaseScope {
        accountID: string;
        showTable: boolean;

        buildKendoGrid(): void;
        gridOptions: any;
        pointsDataSource: kendo.data.DataSource;
        pointsAccountingRepository: AppCommon.PointsAccountingRepository;
        customerIdentifierParam: string;
        createdBy: string;
        genericUtils: AppCommon.GenericUtils; // for html calls
        enumUtils: AppCommon.EnumUtils; // for html calls
    }

    class PointsEarnedHistory extends AppCommon.ListViewDirectiveBase {
        restrict = "E";
        templateUrl = "/appCommon/directives/customer/reward/pointsEarnedHistory.directive.html";
        scope = {
        };

        static $inject = ["$stateParams", "SessionService", "KendoDataSourceService", "AuthService", "PointsAccountingRepository"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private kendoDataSourceService: AppCommon.KendoDataSourceService,
            private authService: AppCommon.AuthService,
            private pointsRepository: AppCommon.PointsAccountingRepository) {

            super();
        }

        link: ng.IDirectiveLinkFn = (scope: IPointsEarnedHistoryScope, elements: ng.IAugmentedJQuery, attrs: AppCommon.IListViewDirectiveBaseAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.genericUtils = GenericUtils;
            scope.enumUtils = EnumUtils;
            scope.showTable = false;

            // so employee can view customer info
            scope.customerIdentifierParam = this.$stateParams["customerIdentifier"];
            if (!!scope.customerIdentifierParam) {
                self.sessionService.userInfo.customerAccountID = self.$stateParams["customerIdentifier"];
            }
            scope.createdBy = self.sessionService.userInfo.customerAccountID;

            var listview = $("#listView").data("kendoListView");

            self.initializeScope(scope, attrs);

            scope.dataSource = self.kendoDataSourceService.getDataSource("PointsAccounting/GetByAccountIDExtended/", null, self.sessionService.userInfo.customerAccountID);
            scope.dataSource.filter([
                { field: "Status", operator: "neq", value: "Cancelled" }
            ]);
            scope.dataSource.fetch(() => {          //manually fetch so we can control changing state if need be
                scope.showTable = true;
                var recordCount = scope.dataSource.total();
                if (recordCount === 0) {
                    //
                } else {
                    listview.setDataSource(scope.dataSource);
                    listview.refresh();
                }
            });
        };
    };

    angular.module("app.common")
        .directive("pointsEarnedHistory",
        ["$stateParams", "SessionService", "KendoDataSourceService", "AuthService", "PointsAccountingRepository",
            (sparams, ss, kdss, auth, paRepo) => new PointsEarnedHistory(sparams, ss, kdss, auth, paRepo)]);
}