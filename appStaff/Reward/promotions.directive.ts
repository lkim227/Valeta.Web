module AppStaff {
    import GuidService = AppCommon.GuidService;
    import RestClientBase = AppCommon.RestClientBase;

    export interface IPromotionsAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IPromotionsScope extends ng.IScope {
        onChangeOperatingLocation(newOperatingLocation: OperatingLocationDTO): void;
        selectedOperatingLocationID: string;

        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        accessLevel: AccessLevel;
        hasViewAccess: boolean;
        hasEditAccess: boolean;
        createdBy: string;

        buildGrid(): void;

        onEdit(e): void;
        saveChanges(e): void;
        cancelChanges(): void;
        detailGridOptions(e): void;

        formMessages: any;
        promotionData: kendo.data.DataSource;
        promotionDiscountData: kendo.data.DataSource;
        promoTypeList: kendo.data.DataSource;
        appliesToList: kendo.data.DataSource;
        dataSourceOfferedServiceList: kendo.data.DataSource;
        promotionCategoryList: kendo.data.DataSource;
        tieredRateList: kendo.data.DataSource;

        newPromotion: PromotionDTO;
        newPromotionDiscount: PromotionDiscountDTO;
        gridOptions: any;
    }

    class PromotionsDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "Reward/promotions.directive.html";
        scope = {

        };

        static $inject = ["$timeout", "dateFilter", "SessionService", "AuthService", "SystemConfigurationService", "ErrorHandlingService", "PromotionRepository", "OfferedServiceRepository", "DefinedListRepository"];

        constructor(
            private timeout: ng.ITimeoutService,
            private dateFilter: ng.IFilterDate,
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private systemConfigurationService: AppCommon.SystemConfigurationService,
            private errorHandlingService: AppCommon.ErrorHandlingService,
            private promotionRepository: AppCommon.PromotionRepository,
            private offeredServiceRepository: AppCommon.OfferedServiceRepository,
            private definedListRepository: AppCommon.DefinedListRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IPromotionsScope, elements: ng.IAugmentedJQuery, attrs: IPromotionsAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;

            scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.marketing);
            scope.hasViewAccess = scope.accessLevel >= AccessLevel.View;
            scope.hasEditAccess = scope.accessLevel >= AccessLevel.Edit;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canCreate = getBooleanAttribute(attrs.canCreate) && scope.hasEditAccess;
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate) && scope.hasEditAccess;
            scope.canDelete = getBooleanAttribute(attrs.canDelete) && scope.hasEditAccess;


            scope.selectedOperatingLocationID = null;

            var errors = null;

            scope.onEdit = (e: any): void => {
                if (e.model.isNew()) {
                    e.model.set("OperatingLocationID", scope.selectedOperatingLocationID);
                }
            }

            scope.saveChanges = (e: any): void => {
                this.errorHandlingService.removePageErrors();
                errors = null;
                if (!AppCommon.KendoFunctions.checkCells(e.sender)) {
                    e.preventDefault();
                }
            }

            scope.cancelChanges = (): void => {
                this.errorHandlingService.removePageErrors();
                errors = null;
            }

            scope.buildGrid = () => {
                //build datasource
                var schema = {
                    model: {
                        id: "ID",
                        fields: {
                            ID: { editable: false },
                            Code: { validation: { required: true } },
                            Description: { validation: { required: true } },
                            StartDate: { type: "date", defaultValue: (new Date()).toLocaleDateString(), validation: { required: true } },
                            EndDate: { type: "date", defaultValue: null },
                            IsOneTime: { type: "boolean", defaultValue: false },
                            IsActive: { type: "boolean", defaultValue: true },
                            PromotionCategory: { type: "string" }
                        }
                    }
                };
                var parameterMap = (data: PromotionDTO, operation: string) => {
                    if (operation !== "read") {
                        data.StartDate = this.dateFilter(data.StartDate, AppCommon.AppCommonConfig.isoDateOnlyFormat);
                        data.EndDate = this.dateFilter(data.EndDate, AppCommon.AppCommonConfig.isoDateOnlyFormat);
                        return data;
                    } else {
                        return data;
                    }
                };
                var readCommand = {
                    url: AppConfig.APIHOST + "Promotion/GetByOperatingLocationID/" + scope.selectedOperatingLocationID,
                    type: "get",
                    dataType: "json",
                    contentType: "application/json",
                    beforeSend: req => {
                        req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                    }
                };
                var updateCommand = {
                    url: AppConfig.APIHOST + "Promotion/UpdateAndQuery",
                    type: "post",
                    beforeSend: req => {
                        req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                    }
                };
                var createCommand = {
                    url: AppConfig.APIHOST + "Promotion/CreateAndQuery",
                    type: "post",
                    beforeSend: req => {
                        req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                    }
                };
                var deleteCommand = {
                    url: function (options) {
                        return AppConfig.APIHOST + "Promotion/Delete/" + options.ID;
                    },
                    type: "delete",
                    beforeSend: req => {
                        this.errorHandlingService.removePageErrors();
                        errors = null;
                        req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                    }
                };
                var errorHandler = (e) => {
                    var newError = JSON.parse(e.xhr.responseText).ExceptionMessage;
                    if (errors === null) {
                        // If there are any errors, even the successful changes will not be reflected in the grid. Could force it with updates, but not (easily) for creates.
                        // http://www.telerik.com/forums/update-dirty-property-manually
                        errors = "Note: Some changes may have completed successfully. Please refresh the page before making additional changes." + "\n\n" + newError;
                    } else {
                        errors = errors + "\n" + newError;
                    }

                    this.errorHandlingService.showPageError(errors);
                }
                var changeHandler = (e) => {
                    // http://www.telerik.com/forums/losing-dirty-flag-on-edited-items-when-i-click-add-new-item
                    if (e.action === "itemchange") {
                        e.items[0].dirtyFields = e.items[0].dirtyFields || {};
                        e.items[0].dirtyFields[e.field] = true;
                    }
                }

                scope.promotionData = AppCommon.KendoDataSourceFactory.createKendoHierarchicalDataSource(
                    "Promotion", schema, parameterMap, readCommand, updateCommand, createCommand, deleteCommand, errorHandler, changeHandler);
                scope.promotionData.fetch(() => {
                    // force to rerender table when OL changes
                    var grid = $("#promotionsGrid").data("kendoGrid");
                    grid.setDataSource(scope.promotionData);
                    grid.refresh();
                });

                scope.promoTypeList = new kendo.data.DataSource({
                    schema: {
                        model: {
                            id: "Value",
                            fields: {
                                Value: { type: "boolean" },
                                Description: {}
                            }
                        }
                    }
                });
                scope.promoTypeList.add({ Description: "%", Value: true });
                scope.promoTypeList.add({ Description: "$", Value: false });
                var promoTypes = "<input k-on-change=\"dataItem.dirty=true\" kendo-drop-down-list k-data-text-field=\x22'Description'\x22 k-data-value-field=\x22'Value'\x22  k-data-source=\"promoTypeList\" k-value-primitive=\"true\" k-ng-model=\"dataItem.Discount.IsPercentage\" name=\"Discount.IsPercentage\"/>";

                //get appliesTo enum as a list
                scope.appliesToList = AppCommon.KendoFunctions.getEnumAsKendoDataSource(PromotionAppliesTo, null);
                var appliesTo = "<input k-on-change=\"dataItem.dirty=true\" kendo-drop-down-list k-data-text-field=\x22'Description'\x22 k-data-value-field=\x22'Value'\x22  k-data-source=\"appliesToList\" k-value-primitive=\"true\" k-ng-model=\"dataItem.AppliesTo\" name=\"AppliesTo\"/>";

                //get additional services list
                scope.dataSourceOfferedServiceList = AppCommon.KendoFunctions.getOfferedServices(AppConfig.APIHOST + "OfferedService/GetAll");
                var offeredServicesEditor = "<input k-on-change=\"dataItem.dirty=true\" kendo-drop-down-list k-data-text-field=\x22'ServiceName'\x22 k-data-value-field=\x22'ID'\x22  k-data-source=\"dataSourceOfferedServiceList\" k-value-primitive=\"true\" k-ng-model=\"dataItem.OfferedServiceID\" name=\"OfferedServiceID\"/>";
                var offeredServicesTemplate = "<input readonly kendo-drop-down-list k-data-text-field=\x22'ServiceName'\x22 k-data-value-field=\x22'ID'\x22  k-data-source=\"dataSourceOfferedServiceList\" k-value-primitive=\"true\" k-ng-model=\"dataItem.OfferedServiceID\" name=\"OfferedServiceID\"/>";

                //get promotion categories
                scope.promotionCategoryList = AppCommon.KendoFunctions.getDefinedListAsKendoDataSource("PromotionCategory");
                var definedListPromotionCategory = (container, options) => {
                    $('<input id="categorySelector" data-bind="value : PromotionCategory"/>')
                        .appendTo(container)
                        .kendoDropDownList({
                            dataSource: scope.promotionCategoryList,
                            dataTextField: "Description",
                            dataValueField: "Value",
                            valuePrimitive: true
                        });
                };

                //get tiered rates
                scope.tieredRateList = AppCommon.KendoFunctions.getTieredRates(AppConfig.APIHOST + CommonConfiguration_Routing.OperatingLocationRoute + "/" + CommonConfiguration_Routing_OperatingLocationMethods.GetTieredRatesForOperatingLocationID + "/" + scope.selectedOperatingLocationID);
                var tieredRateEditor = "<input k-on-change=\"dataItem.dirty=true\" kendo-drop-down-list k-data-text-field=\x22'Name'\x22 k-data-value-field=\x22'Name'\x22  k-data-source=\"tieredRateList\" k-value-primitive=\"true\" k-ng-model=\"dataItem.TieredRate_Name\" name=\"TieredRate_Name\"/>";
                var tieredRateTemplate = "<input readonly kendo-drop-down-list k-data-text-field=\x22'Name'\x22 k-data-value-field=\x22'Name'\x22  k-data-source=\"tieredRateList\" k-value-primitive=\"true\" k-ng-model=\"dataItem.TieredRate_Name\" name=\"TieredRate_Name\"/>";


                scope.detailGridOptions = function (dataItem) {

                    //var dataitem = this.dataItem($(kendoEvent.currentTarget).closest("tr"));

                    //build datasource
                    const schema2 = {
                        model: {
                            id: "ID",
                            fields: {
                                ID: { editable: false },
                                PromotionID: { editable: false, defaultValue: dataItem.ID },
                                Discount: {
                                    fields: {
                                        IsPercentage: { type: "boolean", defaultValue: true },
                                        Amount: { type: "number" }
                                    }
                                },
                                AppliesTo: { defaultValue: "All" },
                                OfferedServiceID: {},
                                TieredRate_Name: {},
                                WhichParkingDay: { type: "number", defaultValue: 0 }
                            }
                        }
                    };
                    const parameterMap2 = (data: PromotionDiscountDTO, operation: string) => {
                        //if (operation === "read") {
                        //    if (!!data.OfferedServiceID) {
                        //            data.OfferedServiceID = AppCommon.KendoFunctions.findAdditionalServiceNameInKendoDataSource(data.OfferedServiceID, scope.offeredServices);
                        //    }
                        //}
                        return data;
                    };
                    const readCommand2 = {
                        url: AppConfig.APIHOST + "PromotionDiscount/GetByPromotionID/" + dataItem.ID,
                        type: "get",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                        }
                    };
                    scope.promotionDiscountData = AppCommon.KendoDataSourceFactory.createKendoDataSource("PromotionDiscount", schema2, parameterMap2, readCommand2);

                    //build grid
                    const filterable2 = "false";
                    const columns2 = [
                        { field: "PromotionID", hidden: true, filterable: false },
                        {
                            field: "AppliesTo",
                            title: "Applies To",
                            editor: appliesTo,
                            template:
                            "#= AppCommon.GenericUtils.camelToTitle(AppCommon.EnumUtils.getNameForValuePromotionAppliesTo(AppliesTo)) #",
                            filterable: false
                        },
                        {
                            field: "TieredRate_Name",
                            title: "Which Rate Tier?",
                            template: tieredRateTemplate,
                            editor: tieredRateEditor,
                            filterable: false
                        },
                        {
                            field: "OfferedServiceID",
                            title: "Which Additional Service?",
                            template: offeredServicesTemplate,
                            editor: offeredServicesEditor,
                            filterable: false
                        },
                        { field: "WhichParkingDay", title: "Which Parking Day?", type: "number", format: "{0:n0}", filterable: false },
                        { field: "Discount.IsPercentage", title: "Type", template: "#= Discount.IsPercentage ? '%' : '$' #", type: "boolean", editor: promoTypes, filterable: false },
                        { field: "Discount.Amount", title: "Value", type: "number", format: "{0:n2}", filterable: false },
                        { command: "destroy", title: "", width: "120px", hidden: !scope.canDelete }
                    ];
                    return AppCommon.KendoFunctions.getGridOptions(
                        scope.promotionDiscountData,
                        "PromotionDiscount",
                        scope.canCreate,
                        scope.canUpdate,
                        filterable2,
                        columns2);
                };


                //build grid
                var filterable = "false";
                var columns = [
                    { field: "ID", hidden: true },
                    {
                        field: "Code",
                        filterable: {
                            cell: {
                                operator: "contains",
                                showOperators: false
                            }
                        },
                        template: "#= AppCommon.KendoFunctions.dirtyField(data,'Code')# #:Code#"
                    },
                    {
                        field: "Category",
                        title: "Category",
                        template: "#= (!!PromotionCategory) ? PromotionCategory : '' #",
                        editor: definedListPromotionCategory
                    },
                    {
                        field: "Description",
                        filterable: {
                            cell: {
                                operator: "contains",
                                showOperators: false
                            }
                        },
                        template: "#= AppCommon.KendoFunctions.dirtyField(data,'Description')# #:Description#"
                    },
                    { field: "StartDate", title: "Start Date", format: "{0:d}", filterable: true },
                    { field: "EndDate", title: "End Date", format: "{0:d}", filterable: true },
                    { field: "IsOneTime", title: "Use once?", template: "#= IsOneTime ? 'yes' : 'no' #", filterable: { messages: { isTrue: "yes", isFalse: "no" } } },
                    { field: "IsActive", title: "Active?", template: "#= IsActive ? 'yes' : 'no' #", filterable: { messages: { isTrue: "yes", isFalse: "no" } } },
                    { command: "destroy", title: "", width: "120px", hidden: !scope.canDelete }
                ];
                scope.gridOptions = AppCommon.KendoFunctions.getGridOptions(
                    scope.promotionData,
                    "Promotion",
                    scope.canCreate,
                    scope.canUpdate,
                    filterable,
                    columns,
                    scope.saveChanges,
                    "incell",
                    scope.onEdit
                );
            }

            scope.onChangeOperatingLocation = (newOperatingLocation: OperatingLocationDTO): void => {

                if (newOperatingLocation == null) {
                    scope.selectedOperatingLocationID = null;
                    return;
                }
                scope.selectedOperatingLocationID = newOperatingLocation.ID;

                scope.buildGrid();
            };

            var waitForDom = () => {
                // There is no event for toolbar cancel changes button so have to bind to button click
                // http://www.telerik.com/forums/listen-to-cancel-changes-button-event---toolbar
                $(".k-grid-cancel-changes").click(() => scope.cancelChanges());
            }

            setTimeout(waitForDom, 0);
        };

    }

    angular.module("app.staff")
        .directive("promotions",
        ["$timeout", "dateFilter", "SessionService", "AuthService", "SystemConfigurationService", "ErrorHandlingService", "PromotionRepository", "OfferedServiceRepository", "DefinedListRepository",
            (to, df, s, auth, sc, ehs, pr, asr, dlr) => new PromotionsDirective(to, df, s, auth, sc, ehs, pr, asr, dlr)]);
}