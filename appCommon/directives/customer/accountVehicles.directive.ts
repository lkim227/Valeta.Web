module AppCommon {

    export interface IAccountVehiclesScope extends AppCommon.IListViewDirectiveBaseScope {
        selectedVehicle: VehicleDTO;
        accountID: string;

        onAdd: () => void;
        onSave: (e: any) => void;
        onChange: (dataItem: any) => void;
        onEdit: (dataItem: any) => void;
        onCancel: (dataItem: any) => void;
        onDelete: (e: any) => void;
        onClick: (dataItem: any) => void;
        isInEditMode: boolean;

        getAllMakes(): void;
        getModelsForVehicle(dataItem: VehicleDTO): void;
        getYearsForVehicle(dataItem: VehicleDTO): void;
        resetVehicleModel(dataItem: VehicleDTO): void;
        resetVehicleYear(dataItem: VehicleDTO): void;

        isValidModel(dataItem: VehicleDTO): void;

        makes: Array<string>;
        models: Array<string>;
        years: Array<string>;
        errorYearMessage: string;
    }

    class AccountVehiclesDirective extends AppCommon.ListViewDirectiveBase {
        templateUrl = AppCommonConfig.accountVehiclesTemplateUrl;
        scope = {
            selectedVehicle: "=?"
        };

        static $inject = ["$state", "$stateParams", "SessionService", "KendoDataSourceService", "ManufactureRepository"];

        constructor(private $state: ng.ui.IStateService,
                    private $stateParams: ng.ui.IStateParamsService,
                    private sessionService: AppCommon.SessionService,
                    private kendoDataSourceService: AppCommon.KendoDataSourceService,
                    private manufactureRepository: AppCommon.ManufactureRepository) {
            super();
        }

        link: ng.IDirectiveLinkFn = (scope: IAccountVehiclesScope, elements: ng.IAugmentedJQuery, attrs: AppCommon.IListViewDirectiveBaseAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            self.initializeScope(scope, attrs);

            if (_.includes(self.sessionService.userInfo.userRoles, "Employee")) {
                // probably is some staff user
                scope.accountID = this.$stateParams["customerIdentifier"];
                if (typeof (scope.accountID) === "undefined" || scope.accountID === null) {
                    scope.accountID = scope.selectedVehicle.AccountID;
                }
            }
            else {
                // otherwise is customer logged on account
                scope.accountID = self.sessionService.userInfo.customerAccountID;
            }

            var listview = $("#listView").data("kendoListView");

            var csvSplit = (csvValue: string): string[] => {
                if (!!csvValue && csvValue.length > 0) return csvValue.trim().split(/\s*,\s*/);
                return null;
            };
            var csvJoin = (values: string[]): string => {
                if (!!values && values.length > 0) return values.join().replace(/(^,)/, "");
                return null;
            };

            scope.dataSource = self.kendoDataSourceService.getDataSource(CommonConfiguration_Routing.VehicleRoute, CommonConfiguration_Routing_VehicleMethods.GetByAccountID, scope.accountID);
            scope.dataSource.fetch(() => {
                scope.dataSource.data().forEach((item: any, index: number) => {
                    if (scope.selectedVehicle === item) {
                        scope.onClick(item); // check radio-button
                        scope.$apply();
                    }
                });

            });

            scope.onAdd = () => {
                listview.add();
                scope.isInEditMode = true;
            };

            scope.onSave = e => {
                var electricMagicString = AppCommonConfig.electricMagicString;
                var oversizedMagicString = AppCommonConfig.oversizedMagicString;
                var vehicleAttributes = csvSplit(e.model.Attributes);
                if (vehicleAttributes === null) vehicleAttributes = [];

                var electricNdx = -1;
                if (vehicleAttributes.length > 0) {
                    electricNdx = vehicleAttributes.indexOf(electricMagicString);
                }

                if (e.model.IsElectric) {
                    if (electricNdx < 0) {
                        vehicleAttributes.push(electricMagicString);
                    }
                }
                else {
                    if (electricNdx >= 0) {
                        vehicleAttributes.splice(electricNdx, 1);
                    }
                }

                var oversizedNdx = -1;
                if (vehicleAttributes.length > 0) {
                    vehicleAttributes.indexOf(oversizedMagicString);
                }

                if (e.model.IsOversized) {
                    if (oversizedNdx < 0) {
                        vehicleAttributes.push(oversizedMagicString);
                    }
                }
                else {
                    if (oversizedNdx >= 0) {
                        vehicleAttributes.splice(oversizedNdx, 1);
                    }
                }

                // NOTE: using e.model.set() method we ensure that e.model.dirty == true
                e.model.set("Attributes", csvJoin(vehicleAttributes));
                e.model.set("AccountID", scope.accountID);

                scope.isInEditMode = false;
            };

            scope.onEdit = e => {
                scope.isInEditMode = true;
                if (e.model.isNew()) {
                    e.model.UseTollTag = false;
                }
                if (!!e.model.Attributes) {
                    e.model.set("IsElectric", e.model.Attributes.indexOf("Electric") >= 0);
                    e.model.set("IsOversized", e.model.Attributes.indexOf("Oversized") >= 0);
                }
                else {
                    e.model.set("IsElectric", false);
                    e.model.set("IsOversized", false);
                }
           };

            scope.onCancel = e => {
                scope.isInEditMode = false;
            };

            scope.onChange = dataItem => {
                scope.selectedVehicle = dataItem;
            };

            scope.onDelete = e => {
                var response = confirm("Are you sure you want to delete this vehicle?");
                if (response === false) {
                    e.preventDefault();
                    return;
                }

                scope.isInEditMode = false;
            };

            scope.onClick = dataItem => {
                var item = listview.element.children(`[data-uid='${dataItem.uid}']`);
                listview.select(item);
            };

            //Make-Model-Year
            scope.resetVehicleModel = (dataItem: VehicleDTO): void => {
                dataItem.Model = "";
                $("#selectModel").data("kendoComboBox").value("");
                scope.getModelsForVehicle(dataItem);
            };

            scope.resetVehicleYear = (dataItem: VehicleDTO): void => {
                dataItem.Year = null;
                $("#selectYear").data("kendoComboBox").value("");
                scope.getYearsForVehicle(dataItem);
            };

            scope.getAllMakes = (): void => {
                self.manufactureRepository.getAllMakes()
                    .then((data) => {
                        scope.makes = data;
                    });
            };

            scope.getModelsForVehicle = (dataItem: VehicleDTO): void => {
                if (!!dataItem && !!dataItem.Make) {
                    const make = dataItem.Make;
                    scope.models = [];
                    if (make !== "") {
                        self.manufactureRepository.getAllModelsByMake(make)
                            .then((data) => {
                                scope.models = data;
                            });
                    }
                }
            };

            scope.getYearsForVehicle = (dataItem: VehicleDTO): void => {
                if (!!dataItem) {
                    const make = dataItem.Make;
                    const model = dataItem.Model;
                    scope.years = [];
                    if (make !== "" && model !== "") {
                        self.manufactureRepository.getAllYearsByMakeModel(make, model)
                            .then((data) => {
                                scope.years = data;
                            });
                    }
                }
            };


            //initialize data and event bindings
            scope.getAllMakes();
            listview.bind("remove", (e) => scope.onDelete(e));
        };
    }

    angular.module("app.common")
        .directive("accountVehicles",
        [
            "$state", "$stateParams", "SessionService", "KendoDataSourceService", "ManufactureRepository",
            (state, sparams, sessionService, kendoDS, manuRepo) => new AccountVehiclesDirective(state, sparams, sessionService, kendoDS, manuRepo)
        ]);
}