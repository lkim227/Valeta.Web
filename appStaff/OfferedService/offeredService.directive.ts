module AppStaff {
    export interface IOfferedServiceAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IOfferedServiceScope extends ng.IScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;

        addOfferedService(): void;
        filterList(): void;
        formMessages: any;

        listOfNames: string[];
        filter: any;

        serviceCategoryList: kendo.data.DataSource;

        newOfferedService: OfferedServiceDTO;
        makes: Array<string>;
        gridOptions: any;
    }

    class OfferedServiceDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommon.AppCommonConfig.kendoGridBaseUrl;
        scope = {
        
        };

        static $inject = ["SessionService", "OfferedServiceRepository", "ManufactureRepository"];

        constructor(private sessionService: AppCommon.SessionService,
                    private offeredServiceRepository: AppCommon.OfferedServiceRepository,
                    private manufactureRepository: AppCommon.ManufactureRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IOfferedServiceScope, elements: ng.IAugmentedJQuery, attrs: IOfferedServiceAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;
   
            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canCreate = getBooleanAttribute(attrs.canCreate);
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate);
            scope.canDelete = getBooleanAttribute(attrs.canDelete);

            self.manufactureRepository.getAllMakes().then((data) => {
                scope.makes = data;
            });

            var makesMultiSelector = (container, options) => {
                $("<select id='makesMultiSelector' multiple='multiple' data-bind='value : MakesAvailableFor'/>")
                    .appendTo(container)
                    .kendoMultiSelect({
                        dataSource: scope.makes
                    });
            };

            //build datasource
            var schema = {
                model: {
                    id: "ID",
                    fields: {
                        ID: { editable: false },
                        ServiceName: { validation: { required: true } },
                        Description: {},
                        ServiceFee: { type: "number", validation: { required: true, min: "0.00m" } },
                        ProviderCharge: { type: "number" },
                        TaxRate: { type: "number", defaultValue: 0 },
                        IsActive: { type: "boolean", defaultValue: true },
                        MinDaysNeeded: { type: "number", defaultValue: 1 },
                        Category: {}, // DefinedList.ID (ServiceCategory)
                        MakesAvailableFor: { type: "string" },
                        DisplayOrder: {type: "number", validation: { required: true, min: "0"}}
                    }
                }
            };
            var dataSource = AppCommon.KendoDataSourceFactory.createKendoDataSource(CommonConfiguration_Routing.OfferedServiceRoute, schema, null, null);
            dataSource.sort([
                { field: "Name", dir: "asc" }
            ]);

            scope.addOfferedService = function() {
                dataSource.add(scope.newOfferedService);
                dataSource.sync();
            };

            //get categories
            scope.serviceCategoryList = AppCommon.KendoFunctions.getDefinedListAsKendoDataSource("ServiceCategory");
            var serviceCategoryEditor = (container, options) => {
                $('<input id="categorySelector" data-bind="value : Category"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        dataSource: scope.serviceCategoryList,
                        dataTextField: "Description",
                        dataValueField: "Value",
                        valuePrimitive: true
                    });
            };

            //textarea editors
            var descriptionEditor = (container, options) => {
                $('<textarea class="k-textbox" rows="10" name="' + options.field + '" data-bind="value : Description"/>')
                    .appendTo(container);
            };

            //build grid
            var filterable = "false";
            var columns = [
                { field: "ID", hidden: true },
                {
                    field: "ServiceName",
                    title: "Name",
                    width: "250px",
                    filterable: {
                        cell: {
                            operator: "contains",
                            showOperators: false
                        }
                    }
                },
                { field: "Description", title: "Description", width: "250px", editor: descriptionEditor, filterable: true },
                { field: "ServiceFee", title: "Fee", format: "{0:c}", filterable: true },
                { field: "ProviderCharge", title: "Provider charge", format: "{0:c}", filterable: true },
                { field: "TaxRate", title: "Tax rate %", filterable: true },
                { field: "MinDaysNeeded", title: "Min \# days", filterable: true },
                {
                    field: "Category",
                    title: "Category",
                    editor: serviceCategoryEditor,
                    filterable: false
                },
                { field: "MakesAvailableFor", title: "Restrict to makes", width: "200px", template: "#= $.makeArray(MakesAvailableFor).join(',') #", filterable: false, editor: makesMultiSelector },
                { field: "IsActive", title: "Active?", template: "#= IsActive ? 'yes' : 'no' #", filterable: { messages: { isTrue: "yes", isFalse: "no" } } },
                { field: "DisplayOrder", title: "Display order", filterable: true },
                { command: "destroy", title: "", width: "120px", hidden: !scope.canDelete }
            ];

            scope.gridOptions = AppCommon.KendoFunctions.getGridOptions(
                dataSource,
                "OfferedService",
                scope.canCreate,
                scope.canUpdate,
                filterable,
                columns);

            scope.filterList = () => {
                var stringOfNames;
                stringOfNames = document.getElementById("filterName").valueOf();
                scope.listOfNames = stringOfNames.split(" ");

                scope.filter = {
                    logic: "or",
                    filters: [
                        { field: "Name", operator: "eq", value: scope.listOfNames[0] },
                        { field: "Name", operator: "eq", value: scope.listOfNames[1] },
                        { field: "Name", operator: "eq", value: scope.listOfNames[2] }
                    ]
                };

                dataSource.filter(scope.filter);
                $('#myGrid').data('kendoGrid').dataSource.read();
            }

        };

    }

    angular.module("app.staff")
        .directive("offeredService",
        ["SessionService", "OfferedServiceRepository", "ManufactureRepository",
            (s, ep, man) => new OfferedServiceDirective(s, ep, man)
        ]);
}