module AppStaff {

    export interface IOperatingLocationsScope extends AppCommon.IListViewDirectiveBaseScope {
        accessLevel: AccessLevel;
        hasEditAccess: boolean;

        selectedOperatingLocationId: string;
        operatingLocations: OperatingLocationDTO[];
        newOperatingLocation: OperatingLocationDTO;
        calculationFormulaTypeList: any;
        hideBaseHours: boolean;

        onAdd: () => void;
        onSave: (e: any) => void;
        onChange: (dataItem: any) => void;
        onEdit: (dataItem: any) => void;
        onCancel: (dataItem: any) => void;
        onDelete: (e: any) => void;
        onClick: (dataItem: any) => void;
        isInEditMode: boolean;

        goToZones: (id: string) => void;
        onChangeFormula: (financialConfiguration: FinancialConfigurationDTO) => void;

        loadingPromise: ng.IPromise<any>;

        formMessages: any;
    }

    class OperatingLocationsDirective extends AppCommon.ListViewDirectiveBase {
        templateUrl = AppStaffConfig.operatingLocationsTemplateUrl;
        scope = {
        
        };

        static $inject = ["$q", "SessionService", "KendoDataSourceService", "OperatingLocationRepository", "AuthService"];

        constructor(
            private $q: ng.IQService,
            private sessionService: AppCommon.SessionService,
            private kendoDataSourceService: AppCommon.KendoDataSourceService,
            private operatingLocationRepository: AppCommon.OperatingLocationRepository,
            private authService: AppCommon.AuthService) {
            super();
        }


        link: ng.IDirectiveLinkFn = (scope: IOperatingLocationsScope, elements: ng.IAugmentedJQuery, attrs: AppCommon.IListViewDirectiveBaseAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            var listview = $("#listView").data("kendoListView");
            
            self.initializeScope(scope, attrs);
            scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.systemSetup);
            scope.hasEditAccess = scope.accessLevel >= AccessLevel.Edit;

            scope.canCreate = scope.canCreate && scope.hasEditAccess;
            scope.canUpdate = scope.canUpdate && scope.hasEditAccess;

            // The listView will have its own loading indicator once all the operating locations have been returned,
            // but we need a loading indicator while waiting for the operating locations. Since getDataSource does not
            // return a promise, set loadingPromise manually and resolve when data is bound
            var deferred = self.$q.defer();
            scope.loadingPromise = deferred.promise;

            scope.dataSource = self.kendoDataSourceService.getDataSource("OperatingLocation", "GetAll");

            scope.onChange = dataItem => {
                scope.selectedOperatingLocationId = dataItem.ID;
            };
            scope.onDelete = e => {
                var response = confirm("Are you sure you want to delete this operating location?");
                if (response === false) {
                    e.preventDefault();
                    return;
                }

                if (e.model.ID === scope.selectedOperatingLocationId) {
                    listview.clearSelection();
                    scope.selectedOperatingLocationId = null;
                }

                scope.isInEditMode = false;
            };
            scope.onClick = dataItem => {
                var item = listview.element.children(`[data-uid='${dataItem.uid}']`);
                listview.select(item);
            };

            //initialize data and event bindings
            listview.bind("remove", (e) => scope.onDelete(e));
            listview.bind("dataBound",
                (e) => {
                    listview.unbind("dataBound");
                    deferred.resolve();
                });
        };
    }

    angular.module("app.staff")
        .directive("operatingLocations",
        ["$q", "SessionService", "KendoDataSourceService", "OperatingLocationRepository", "AuthService",
            (q, s, ks, ep, auth) => new OperatingLocationsDirective(q, s, ks, ep, auth)]);
}