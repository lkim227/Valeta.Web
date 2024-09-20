module AppStaff {
    import GenericUtils = AppCommon.GenericUtils;

    export interface IZoneLotsAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IZoneLotsScope extends ng.IScope {
        operatingLocationIdParam: string;

        accessLevel: AccessLevel;
        hasEditAccess: boolean;
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;

        formMessages: any;

        maxRowsCount: number;
        dataSourceSpreadsheet: any; // kendo.data.DataSource; -->  ZoneLotSpreadsheetDTO[]
        spreadsheet: any;
        sheetOptions: any;

        availableZones: ZoneDTO[];
        availableLots: LotDTO[];

        emptyZoneCodeError: boolean;
        emptyLotNameError: boolean;

        onSave(): void;
    }

    class ZoneLotsDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.zoneLotsTemplateUrl;
        scope = {
            //selectedOperatingLocationId: "=?"
        };

        static $inject = ["$stateParams", "$q", "SessionService", "AuthService", "ZoneRepository", "LotRepository", "DefinedListRepository"];

        constructor(private $stateParams: ng.ui.IStateParamsService,
            private $q: ng.IQService,
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private zoneRepository: AppCommon.ZoneRepository,
            private lotRepository: AppCommon.LotRepository,
            private definedListRepository: AppCommon.DefinedListRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IZoneLotsScope, elements: ng.IAugmentedJQuery, attrs: IZoneLotsAttrs, ngModelCtrl: ng.INgModelController) => {
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
                scope.emptyZoneCodeError = false;
                scope.emptyLotNameError = false;
            }
            resetErrorIndicators();

            var anyErrorIndicatorsSet = (): boolean => {
                var hasErrors = scope.emptyZoneCodeError ||
                    scope.emptyLotNameError;
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

            var spreadsheetHasChanges = (): boolean => {
                return scope.dataSourceSpreadsheet.destroyed().length > 0
                    || scope.dataSourceSpreadsheet.data().filter(x =>
                        x.dirty && (
                            !x.isNew()
                            || (x.isNew() && (
                                !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.ZoneCode)
                                || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.LotName))))).length > 0;
            }

            var validateRows = (rows) => {
                resetErrorIndicators();

                rows.forEach(row => {
                    if (GenericUtils.isUndefinedNullEmptyOrWhiteSpace(row.ZoneCode)) {
                        scope.emptyZoneCodeError = true;
                    }
                    if (GenericUtils.isUndefinedNullEmptyOrWhiteSpace(row.LotName)) {
                        scope.emptyLotNameError = true;
                    }
                });
            }

            var getZoneIDByCode = (code: string): string => {
                var result = scope.availableZones.filter(x => x.Code === code);
                if (result.length > 0) {
                    return result[0].ID;
                }
                return null;
            };

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
                    || GenericUtils.isUndefinedOrNull(scope.availableZones)
                    || GenericUtils.isUndefinedOrNull(scope.availableLots)) {
                    return;
                }

                var activeSheet: kendo.spreadsheet.Sheet = scope.spreadsheet.activeSheet();

                if (scope.availableZones.length > 0) {
                    var zoneCodes = scope.availableZones.map(x => x.Code);
                    activeSheet.range("C2:C500").validation({
                        dataType: "list",
                        showButton: true,
                        comparerType: "list",
                        from: getValidatorKendoList(zoneCodes),
                        allowNulls: false,
                        type: "reject",
                        messageTemplate: "Invalid zone."
                    });
                }

                if (scope.availableLots.length > 0) {
                    var lotCodes = scope.availableLots.map(x => x.Name);
                    activeSheet.range("E2:E500").validation({
                        dataType: "list",
                        showButton: true,
                        comparerType: "list",
                        from: getValidatorKendoList(lotCodes),
                        allowNulls: false,
                        type: "reject",
                        messageTemplate: "Invalid lot."
                    });
                }

                setLoadingProgress(false);
            };

            var updateZoneCodes = () => {
                var deferred = self.$q.defer();

                if (!!scope.operatingLocationIdParam) {
                    self.zoneRepository.getByOperatingLocationID(scope.operatingLocationIdParam)
                        .then((data: ZoneDTO[]) => {
                            data.sort((a, b) => (a.Code < b.Code ? -1 : 1));
                            scope.availableZones = data;
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

            var getAllRowsWithVisibleData = (): any => {
                return scope.dataSourceSpreadsheet.data().filter(x =>
                    !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.ZoneCode)
                    || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.LotName));
            }

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
            var readCommand = {
                url: AppConfig.APIHOST + "Zone/GetLotMappingSpreadsheetByOperatingLocationID/" + scope.operatingLocationIdParam,
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
            var schema = {
                model: { // ZoneLotSpreadsheetDTO
                    id: "ZoneID",
                    fields: {
                        ZoneID: { type: "string", editable: false },
                        ZoneCode: { type: "string", validation: { required: true } },
                        OperatingLocationID: { type: "string", editable: false },
                        LotID: { type: "string", validation: { required: true } },
                        LotName: { type: "string", validation: { required: true } },
                        LotOrder: { type: "number" }
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
                        x.ZoneID = getZoneIDByCode(x.ZoneCode);
                        x.LotID = getLotIDByName(x.LotName);
                        if (x.LotOrder > -1) x.LotOrder = index; // using index from datasource/spreadsheet row order
                    });
                    setLoadingProgress(true);
                    self.zoneRepository.updateFromZoneLotSpreadsheet(scope.operatingLocationIdParam, rowsToSave)
                        .then((success) => {
                            if (success) {
                                scope.dataSourceSpreadsheet.read()
                                    .then(() => setLoadingProgress(false));
                            } else {
                                setLoadingProgress(false);
                            }
                        });
                }
            };

            scope.dataSourceSpreadsheet = AppCommon.KendoDataSourceFactory.createKendoDataSource("Zone", schema, null, readCommand, null, null, null, null, changeHandler);

            scope.dataSourceSpreadsheet.options.batch = true;

            scope.sheetOptions = {
                toolbar: {
                    home: [
                        {
                            type: "button",
                            text: "Refresh",
                            icon: "refresh",
                            click: () => {
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
                columns: 6, // default 50
                sheets: [
                    {
                        name: "Zone Lots",
                        dataSource: scope.dataSourceSpreadsheet,
                        frozenRows: 1,
                        rows: [{
                            height: 30,
                            cells: [
                                {
                                    index: 2, value: "Zone Code", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }, {
                                    index: 4, value: "Lot Name", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }]
                        }],
                        columns: [
                            {
                                width: 0  // OperatingLocationID (hidden)
                            }, {
                                width: 0  // ZoneID
                            }, {
                                width: 300  // ZoneCode (only show column with Zone's name)
                            }, {
                                width: 0  // LotID
                            }, {
                                width: 300  // LotName
                            }, {
                                width: 0 // LotOrder
                            }
                        ]
                    }
                ]
            };

            // init
            $(document).ready(() => {
                updateZoneCodes();
                updateLotNames();
            });
        };
    }

    angular.module("app.staff")
        .directive("zoneLots",
        [
            "$stateParams", "$q", "SessionService", "AuthService", "ZoneRepository", "LotRepository", "DefinedListRepository",
            (st, q, s, auth, zp, lr, dlr) => new ZoneLotsDirective(st, q, s, auth, zp, lr, dlr)
        ]);
}