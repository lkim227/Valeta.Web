module AppStaff {
    import GenericUtils = AppCommon.GenericUtils;

    export interface ITieredRateAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface ITieredRateScope extends ng.IScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;

        formMessages: any;

        operatingLocationIdentifier: string;
        tieredRates: TieredRateDTO[];

        onDataBound(event: any): void;
        saveChanges(event: any): void;
        removeTieredRate(event: any): void;
        mapKendoModel(obj: any): TieredRateDTO;

        gridOptions: any;
        buildKendoGrid(): void;
        dataSource: kendo.data.DataSource;
    }

    class TieredRateDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommon.AppCommonConfig.kendoGridBaseUrl;
        scope = {
            operatingLocationIdentifier: "=",
            tieredRates: "="
        };

        static $inject = ["SessionService", "OperatingLocationRepository"];

        constructor(private sessionService: AppCommon.SessionService, private operatingLocationRepository: AppCommon.OperatingLocationRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: ITieredRateScope, elements: ng.IAugmentedJQuery, attrs: ITieredRateAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canCreate = getBooleanAttribute(attrs.canCreate);
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate);
            scope.canDelete = getBooleanAttribute(attrs.canDelete);

            scope.$watch("operatingLocationIdentifier",
                (newValue) => {
                    if (typeof (newValue) == "undefined") {
                        scope.$evalAsync(() => { scope.tieredRates = null; });
                    }
                    else {
                        scope.buildKendoGrid();
                    }
                });

            scope.buildKendoGrid = () => {
                //build datasource
                scope.dataSource = new kendo.data.DataSource({
                    data: scope.tieredRates, // passed by directive scope
                    autoSync: false,
                    batch: false,
                    schema: {
                        model: {
                            fields: {
                                Name: { validation: { required: true }},
                                Description: {},
                                HourStart: { type: "number", validation: { required: true, min: "0" } },
                                Rate: { type: "number", validation: { required: true, min: "0" } }
                            }
                        }
                    },
                    sort: { field: "HourStart", dir: "asc" }
                });

                //build grid
                var columns = [
                    { field: "Name", title: "Name", filterable: false },
                    { field: "Description", title: "Description", filterable: false },
                    { field: "Rate", title: "Rate", format: "{0:c}", filterable: false },
                    { field: "HourStart", title: "Hour rate starts", filterable: false },
                    { command: "destroy", title: "", width: "120px" }
                ];

                scope.gridOptions = {
                    dataSource: scope.dataSource,
                    pageable: false,
                    scrollable: {
                        virtual: true
                    },
                    filterable: false,
                    navigatable: true,
                    resizable: false,
                    sortable: true,
                    selectable: true,
                    toolbar: AppCommon.KendoFunctions.getToolbarOptions(true, false, false),
                    editable: "incell",
                    dataBound: (e) => scope.onDataBound(e),
                    remove: (e) => scope.removeTieredRate(e),
                    save: (e) => scope.saveChanges(e),
                    columns: columns
                };
            }

            var updateModelFromDataSource = () => {
                // Update entire scope model since tiered rates don't have an ID and therefore model and dataSource items
                // cannot be mapped.
                // Note: cannot use indexOf to map model and dataSource items because the indexes for dataSource items
                // can change due to sorting and adding new records, without any reference to the model. (bug 2938)
                scope.tieredRates = [];
                var items = scope.dataSource.data();
                for (let i = 0; i < items.length; i++) {
                    scope.tieredRates.push(items[i]);
                }
            }

            scope.onDataBound = (ev: any) => {
                // DataBound occurs during initialization and when new records are added
                updateModelFromDataSource();
            };

            scope.saveChanges = (ev: any) => {
                updateModelFromDataSource();
            };

            scope.removeTieredRate = (ev: any) => {
                if (scope.dataSource.data().length === 1) {
                    alert("Cannot delete! You must have at least one rate tier specified.");
                    const tieredRateModel = scope.mapKendoModel(ev);
                    scope.dataSource.add(tieredRateModel);
                }
                updateModelFromDataSource();
            };

            scope.mapKendoModel = (obj: any) => {
                var tieredRate = new TieredRateDTO();
                if (GenericUtils.isUndefinedOrNull(obj.values)) {
                    // obj.values are undefined for deleted records
                    tieredRate.HourStart = obj.model.HourStart;
                    tieredRate.Rate = obj.model.Rate;
                } else {
                    tieredRate.HourStart = obj.values.HourStart || obj.model.HourStart;
                    tieredRate.Rate = obj.values.Rate || obj.model.Rate;
                }
                return tieredRate;
            }
        };

    }

    angular.module("app.staff")
        .directive("tieredRate",
        ["SessionService", "OperatingLocationRepository", (s, olp) => new TieredRateDirective(s, olp)]);
}