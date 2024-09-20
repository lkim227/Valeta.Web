module AppStaff {
    import RewardRepository = AppCommon.RewardRepository;

    export interface IRewardAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IRewardScope extends ng.IScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;

        addReward(): void;
        formMessages: any;
        rewardData: kendo.data.DataSource;
        additionalServiceApplyToList: kendo.data.DataSource;
        dataSourceAdditionalServiceList: kendo.data.DataSource;

        newReward: RewardDTO;
        gridOptions: any;
    }

    class RewardDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommon.AppCommonConfig.kendoGridBaseUrl;
        scope = {
        
        };

        static $inject = ["SessionService", "RewardRepository"];

        constructor(private sessionService: AppCommon.SessionService, private RewardRepository: RewardRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IRewardScope, elements: ng.IAugmentedJQuery, attrs: IRewardAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canCreate = getBooleanAttribute(attrs.canCreate);
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate);
            scope.canDelete = getBooleanAttribute(attrs.canDelete);

            //build datasource
            var schema = {
                model: {
                    id: "ID",
                    fields: {
                        ID: { editable: false },
                        Name: { validation: { required: true } },
                        Description: {},
                        Points: { type: "number", validation: { required: true, min: "0" } },
                        IsActive: { type: "boolean", defaultValue: true },
                        QuantityAvaialable: { type: "number", defaultValue: 1 },
                        AppliesTo: { defaultValue: "Gift" },
                        OfferedServiceID: {},
                        CustomerVisible: { type: "boolean", defaultValue: true },
                        OfficeNote: {}
                    }
                }
            };
            var dataSource = AppCommon.KendoDataSourceFactory.createKendoDataSource(CommonConfiguration_Routing.RewardRoute, schema, null, null);
            dataSource.sort([
                { field: "Type", dir: "asc" },
                { field: "Name", dir: "asc" }
            ]);

            scope.addReward = function() {
                scope.rewardData.add(scope.newReward);
                scope.rewardData.sync();
            };

            //get applyTo enum as a list
            scope.additionalServiceApplyToList = AppCommon.KendoFunctions.getEnumAsKendoDataSource(RewardAppliesTo, null);
            var appliesTo = "<input k-on-change=\"dataItem.dirty=true\" kendo-drop-down-list k-data-text-field=\x22'Description'\x22 k-data-value-field=\x22'Value'\x22  k-data-source=\"additionalServiceApplyToList\" k-value-primitive=\"true\" k-ng-model=\"dataItem.AppliesTo\" name=\"AppliesTo\"/>";

            //get additional services
            scope.dataSourceAdditionalServiceList = AppCommon.KendoFunctions.getOfferedServices(AppConfig.APIHOST + "OfferedService/GetAll");               
            var additionalServices = "<input k-on-change=\"dataItem.dirty=true\" kendo-drop-down-list k-data-text-field=\x22'ServiceName'\x22 k-data-value-field=\x22'ID'\x22  k-data-source=\"dataSourceAdditionalServiceList\" k-value-primitive=\"true\" k-ng-model=\"dataItem.OfferedServiceID\" name=\"OfferedServiceID\"/>";
            var additionalServicesDisplay = "<input readonly=\"readonly\" kendo-drop-down-list k-data-text-field=\x22'ServiceName'\x22 k-data-value-field=\x22'ID'\x22  k-data-source=\"dataSourceAdditionalServiceList\" k-value-primitive=\"true\" k-ng-model=\"dataItem.OfferedServiceID\" name=\"AdditionalServiceName\"/>";

            //textarea editors
            var nameEditor = (container, options) => {
                $('<textarea class="k-textbox" rows="5" name="' + options.field + '" data-bind="value : Name"/>')
                    .appendTo(container);
            };
            var descriptionEditor = (container, options) => {
                $('<textarea class="k-textbox" rows="5" name="' + options.field + '" data-bind="value : Description"/>')
                    .appendTo(container);
            };
            var officeNoteEditor = (container, options) => {
                $('<textarea class="k-textbox" rows="5" name="' + options.field + '" data-bind="value : OfficeNote"/>')
                    .appendTo(container);
            };

            //build grid
            var filterable = "false";
            var columns = [
                { field: "ID", hidden: true },
                {
                    field: "Name",
                    width: "250px",
                    editor: nameEditor,
                    filterable: {
                        cell: {
                            operator: "contains",
                            showOperators: false
                        }
                    }
                },
                {
                    field: "Description",
                    width: "250px",
                    editor: descriptionEditor,
                    filterable: {
                        cell: {
                            operator: "contains",
                            showOperators: false
                        }
                    }
                },
                { field: "Points", title: "Points" },
                { field: "QuantityAvailable", title: "Quantity" },
                {
                    field: "AppliesTo",
                    title: "Applies To",
                    editor: appliesTo,
                    template:
                    "#= AppCommon.GenericUtils.camelToTitle(AppCommon.EnumUtils.getNameForValueRewardAppliesTo(AppliesTo)) #",
                    filterable: false
                },
                { field: "OfferedServiceID", title: "Which Additional Service?", template: additionalServicesDisplay, editor: additionalServices },
                { field: "IsActive", title: "Active?", template: "#= IsActive ? 'yes' : 'no' #", filterable: { messages: { isTrue: "yes", isFalse: "no" } } },
                {
                    field: "OfficeNote",
                    title: "Office Note",
                    width: "100px",
                    editor: officeNoteEditor,
                    filterable: {
                        cell: {
                            operator: "contains",
                            showOperators: false
                        }
                    }
                },
                { command: "destroy", title: "", width: "120px", hidden: !scope.canDelete }
            ];
            scope.gridOptions = AppCommon.KendoFunctions.getGridOptions(
                dataSource,
                "Reward",
                scope.canCreate,
                scope.canUpdate,
                filterable,
                columns);
        };

    }

    angular.module("app.staff")
        .directive("rewardAdmin",
            ["SessionService", "RewardRepository", (s, ep) => new RewardDirective(s, ep)]);
}