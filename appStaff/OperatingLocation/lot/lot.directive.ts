module AppStaff {
    import GenericUtils = AppCommon.GenericUtils;

    export interface ILotAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface ILotScope extends ng.IScope {
        operatingLocationIdParam: string;

        availableLots: LotDTO[];

        accessLevel: AccessLevel;
        hasEditAccess: boolean;

        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;

        formMessages: any;

        maxRowsCount: number;
        dataSourceSpreadsheet: any; // kendo.data.DataSource --> LotSlotSpreadsheetDTO[]
        spreadsheet: kendo.ui.Spreadsheet;
        sheetOptions: any;

        attributeList: any;

        emptyLotNameError: boolean;
        emptySlotCodeError: boolean;
        invalidSlotAttributes: string[];
        insertNewAttribute(attribute: string, index: number): void;

        onSave(): void;
    }

    class LotDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.lotTemplateUrl;
        scope = {
            //selectedOperatingLocationId: "=?"
        };

        static $inject = ["$stateParams", "$q", "SessionService", "AuthService", "LotRepository", "DefinedListRepository"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private $q: ng.IQService,
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private lotRepository: AppCommon.LotRepository,
            private definedListRepository: AppCommon.DefinedListRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: ILotScope, elements: ng.IAugmentedJQuery, attrs: ILotAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;

            var getBooleanValue = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.systemSetup);
            scope.hasEditAccess = scope.accessLevel >= AccessLevel.Edit;

            scope.canCreate = getBooleanValue(attrs.canCreate) && scope.hasEditAccess;
            scope.canUpdate = getBooleanValue(attrs.canUpdate) && scope.hasEditAccess;
            scope.canDelete = getBooleanValue(attrs.canDelete) && scope.hasEditAccess;

            scope.operatingLocationIdParam = self.$stateParams["operatingLocationId"];
            scope.maxRowsCount = 3000;

            var resetErrorIndicators = () => {
                scope.emptyLotNameError = false;
                scope.emptySlotCodeError = false;
                scope.invalidSlotAttributes = [];
            }
            resetErrorIndicators();

            var anyErrorIndicatorsSet = (): boolean => {
                var hasErrors = scope.emptyLotNameError ||
                    scope.emptySlotCodeError ||
                    scope.invalidSlotAttributes.length > 0;
                return hasErrors;
            };

            var isLoading: boolean;
            var setLoadingProgress = (progress: boolean) => {
                isLoading = progress;
                kendo.ui.progress($("#spreadsheet"), progress);
            }
            setLoadingProgress(true);

            var enableSave = (enable: boolean) => {
                scope.$evalAsync(() => {
                    $("#save").toggleClass("k-state-disabled", !enable);
                    $("#save-message").toggleClass("hidden", !enable);
                });
            }

            var getAllRowsWithVisibleData = (): any => {
                return scope.dataSourceSpreadsheet.data().filter(x =>
                    !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.LotName)
                    || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.SlotCode)
                    || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.SlotAttributes));
            }

            var spreadsheetHasChanges = (): boolean => {
                return scope.dataSourceSpreadsheet.destroyed().length > 0
                    || scope.dataSourceSpreadsheet.data().filter(x =>
                        x.dirty && (
                            !x.isNew()
                            || (x.isNew() && (
                                !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.LotName)
                                || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.SlotCode)
                                || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.SlotAttributes))))).length > 0;
            }


            var validateAttributes = (slotAttributesToCheck: string) => {
                var attributes: string[] = [];
                if (!GenericUtils.isUndefinedNullEmptyOrWhiteSpace(slotAttributesToCheck)) {
                    attributes = slotAttributesToCheck.split(",").map(s => s.trim()).filter(Boolean); // trim whitespace and filter out empty values
                }

                var invalids = attributes.filter(x => scope.attributeList.map(x => x.Value).indexOf(x.toString()) < 0);
                invalids.forEach((x) => {
                    if (scope.invalidSlotAttributes.indexOf(x) < 0) {
                        scope.invalidSlotAttributes.push(x);
                    }
                });
            }

            var validateRows = (rows) => {
                resetErrorIndicators();

                rows.forEach(row => {
                    if (GenericUtils.isUndefinedNullEmptyOrWhiteSpace(row.LotName)) {
                        scope.emptyLotNameError = true;
                    }
                    if (GenericUtils.isUndefinedNullEmptyOrWhiteSpace(row.SlotCode)) {
                        scope.emptySlotCodeError = true;
                    }
                    validateAttributes(row.SlotAttributes);
                });
            }

            var getLotIDByName = (name: string): string => {
                var result = scope.availableLots.filter(x => x.Name === name);
                if (result.length > 0) {
                    return result[0].ID;
                }
                return null;
            };

            var getValidatorKendoList = (values: any): string => {
                return JSON.stringify(values).replace("[", "{").replace("]", "}");
            };

            var setRangeValidators = (): void => {
                if (GenericUtils.isUndefinedOrNull(scope.spreadsheet)
                    || GenericUtils.isUndefinedOrNull(scope.availableLots)
                    || GenericUtils.isUndefinedOrNull(scope.attributeList)) {
                    return;
                }

                var activeSheet: kendo.spreadsheet.Sheet = scope.spreadsheet.activeSheet();

                if (scope.availableLots.length > 0) {
                    var lotCodes = scope.availableLots.map(x => x.Name);
                    activeSheet.range("C2:C3000").validation({ // so huge num of rows -> try to separate in different sheets
                        dataType: "list",
                        showButton: true,
                        comparerType: "list",
                        from: getValidatorKendoList(lotCodes),
                        allowNulls: false,
                        type: "warning", // Not reject: on this spreadsheet is allowed to add new Lots
                        messageTemplate: "Lot not found. If validated, new lot will be created when saved."
                    });
                }

                setLoadingProgress(false);
                enableSave(spreadsheetHasChanges());
            };


            var updateAttributeValues = () => {
                var deferred = self.$q.defer();

                if (!!scope.operatingLocationIdParam) {
                    self.definedListRepository.fetch("SlotAttribute", AppConfig.APIHOST)
                        .then((data: DefinedListDTO[]) => {
                            data.sort((a, b) => (a.Description < b.Description ? -1 : 1));
                            scope.attributeList = data;
                            setRangeValidators();
                            deferred.resolve();
                        });
                }
                else {
                    deferred.reject("Invalid operating location");
                }

                return deferred.promise;
            };

            var updateLotNames = () => {
                var deferred = self.$q.defer();

                if (!!scope.operatingLocationIdParam) {
                    self.lotRepository.getByOperatingLocation(scope.operatingLocationIdParam)
                        .then((data: LotDTO[]) => {
                            data.sort((a, b) => (a.Name < b.Name ? -1 : 1));
                            scope.availableLots = data;
                            setRangeValidators();
                            deferred.resolve();
                        });
                }
                else {
                    deferred.reject("Invalid operating location");
                }

                return deferred.promise;
            };

            var changeHandler = () => {
                // See EntranceMeetLocationZoneMappingDirective for notes on pattern
                var dataRows = getAllRowsWithVisibleData();
                var hasChanges = spreadsheetHasChanges();
                if (anyErrorIndicatorsSet()) {
                    scope.$evalAsync(() => validateRows(dataRows));
                }
                enableSave(!isLoading && hasChanges);
            };

            //build datasource
            const schema = {
                model: {
                    id: "LotID",
                    fields: {
                        OperatingLocationID: { type: "string", editable: false, hidden: true },
                        LotID: { type: "string", editable: false, hidden: true },
                        LotName: { type: "string" },
                        SlotCode: { type: "string" },
                        SlotAttributes: { type: "string" }
                    }
                }
            };

            const readCommand = {
                url: AppConfig.APIHOST + "Lot/GetSpreadsheetByOperatingLocationID/" + scope.operatingLocationIdParam,
                type: "get",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                },
                complete: () => {
                    if (GenericUtils.isUndefinedOrNull(scope.spreadsheet)) {
                        // First read completed
                        scope.spreadsheet = $("#spreadsheet").data("kendoSpreadsheet");
                        setRangeValidators();
                    }
                }
            };

            scope.onSave = () => {
                if ($("#save").hasClass("k-state-disabled") || isLoading) {
                    return;
                }

                enableSave(false);

                var rowsToSave = getAllRowsWithVisibleData();

                validateRows(rowsToSave);

                if (!anyErrorIndicatorsSet()) {
                    rowsToSave.forEach((x, index) => {
                        // set value to hidden cells
                        x.OperatingLocationID = scope.operatingLocationIdParam;
                        x.LotID = getLotIDByName(x.LotName);
                        if (x.LotOrder > -1) x.LotOrder = index; // using index from datasource/spreadsheet row order
                    });
                    setLoadingProgress(true);
                    self.lotRepository.updateFromSpreadsheet(scope.operatingLocationIdParam, rowsToSave)
                        .then((success) => {
                            if (success) {
                                updateLotNames()
                                    .then(() => scope.dataSourceSpreadsheet.read()
                                        .then(() => setLoadingProgress(false)));
                            } else {
                                setLoadingProgress(false);
                            }
                        });
                }
            };

            scope.insertNewAttribute = (attributeToAdd: string, index: number) => {
                setLoadingProgress(true);
                self.definedListRepository.insertDefinedListValue("SlotAttribute", attributeToAdd)
                    .then(success => {
                        if (success) {
                            updateAttributeValues().then(() => {
                                scope.invalidSlotAttributes.splice(index, 1);
                                setLoadingProgress(false);
                            });
                        }
                    });
            };

            scope.dataSourceSpreadsheet = AppCommon.KendoDataSourceFactory.createKendoDataSource(CommonConfiguration_Routing.LotRoute, schema, null, readCommand, null, null, null, null, changeHandler);

            scope.dataSourceSpreadsheet.options.batch = true;

            scope.sheetOptions = {
                toolbar: {
                    home: [
                        {
                            type: "button",
                            text: "Refresh",
                            icon: "refresh",
                            click: function () {
                                resetErrorIndicators();
                                setLoadingProgress(true);
                                scope.dataSourceSpreadsheet.read()
                                    .then(() => setLoadingProgress(false));
                            }
                        }
                    ],
                    insert: false,
                    data: false
                },
                sheetsbar: false,
                rows: scope.maxRowsCount, // default 200
                columns: 5, // default 50
                sheets: [{
                    name: "Lots",
                    dataSource: scope.dataSourceSpreadsheet,
                    frozenRows: 1,
                    rows: [{
                        height: 30,
                        cells: [
                            {
                                index: 2, value: "Lot Name", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                            }, {
                                index: 3, value: "Slot Code", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                            }, {
                                index: 4, value: "Slot Attributes", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                            }]
                    }],
                    columns: [
                        {
                            width: 0 // OperatingLocationID
                        }, {
                            width: 0 // LotID
                        }, {
                            width: 200 // LotName
                        }, {
                            width: 200   // SlotCode
                        }, {
                            width: 300 // SlotAttributes
                        }
                    ]
                }]
            };

            // init
            $(document).ready(() => {
                updateLotNames();
                updateAttributeValues();
            });
        };
    }

    angular.module("app.staff")
        .directive("lot",
        ["$stateParams", "$q", "SessionService", "AuthService", "LotRepository", "DefinedListRepository",
            (st, q, s, auth, ep, dl) => new LotDirective(st, q, s, auth, ep, dl)]);
}