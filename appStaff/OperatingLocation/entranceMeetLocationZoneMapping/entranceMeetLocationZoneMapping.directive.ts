module AppStaff {
    import GenericUtils = AppCommon.GenericUtils;

    export interface IEntranceMeetLocationZoneMappingAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IEntranceMeetLocationZoneMappingScope extends ng.IScope {
        operatingLocationIdParam: string;

        accessLevel: AccessLevel;
        hasEditAccess: boolean;
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;

        formMessages: any;

        dataSourceSpreadsheet: any; // kendo.data.DataSource
        spreadsheet: kendo.ui.Spreadsheet;
        sheetOptions: any;

        maxRowsCount: number;
        availableEntrances: EntranceDTO[];
        availableZones: ZoneDTO[];

        entranceNames: string[];
        zoneCodes: string[];
        meetLocationValues: string[];

        emptyEntranceNameError: boolean;
        emptyMeetLocationError: boolean;
        emptyZoneCodeError: boolean;
        invalidEntranceNameValues: string[];
        invalidMeetLocationValues: string[];
        insertNewMeetLocation(meetLocation: string, index: number): void;
        invalidZoneCodes: string[];
        insertNewZoneCode(zoneCode: string, index: number): void;

        onSave(): void;
    }

    class EntranceMeetLocationZoneMappingDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.entranceMappingTemplateUrl;
        scope = {
            //selectedOperatingLocationId: "=?"
        };

        static $inject = ["$stateParams", "$q", "SessionService", "AuthService", "KendoDataSourceService", "EntranceRepository", "DefinedListRepository", "ZoneRepository"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private $q: ng.IQService,
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private kendoService: AppCommon.KendoDataSourceService,
            private entranceRepository: AppCommon.EntranceRepository,
            private definedListRepository: AppCommon.DefinedListRepository,
            private zoneRepository: AppCommon.ZoneRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IEntranceMeetLocationZoneMappingScope, elements: ng.IAugmentedJQuery, attrs: IEntranceMeetLocationZoneMappingAttrs, ngModelCtrl: ng.INgModelController) => {
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
                scope.emptyEntranceNameError = false;
                scope.emptyMeetLocationError = false;
                scope.emptyZoneCodeError = false;
                scope.invalidEntranceNameValues = [];
                scope.invalidMeetLocationValues = [];
                scope.invalidZoneCodes = [];
            }
            resetErrorIndicators();

            var anyErrorIndicatorsSet = (): boolean => {
                var hasErrors = scope.emptyEntranceNameError ||
                    scope.emptyMeetLocationError ||
                    scope.emptyZoneCodeError ||
                    scope.invalidEntranceNameValues.length > 0 ||
                    scope.invalidMeetLocationValues.length > 0 ||
                    scope.invalidZoneCodes.length > 0;
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
                    !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.EntranceName)
                    || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.MeetLocation)
                    || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.ZoneCode));
            }

            var spreadsheetHasChanges = (): boolean => {
                return scope.dataSourceSpreadsheet.destroyed().length > 0 ||
                    scope.dataSourceSpreadsheet.data().filter(x =>
                        x.dirty && (
                            !x.isNew()
                            || (x.isNew() && (
                                !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.EntranceName)
                                || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.MeetLocation)
                                || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.ZoneCode))))).length > 0;
            }

            var validateRows = (rows) => {
                resetErrorIndicators();

                rows.forEach(x => {
                    if (GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.EntranceName)) {
                        scope.emptyEntranceNameError = true;
                    } else if (scope.entranceNames.indexOf(x.EntranceName) < 0
                        && scope.invalidEntranceNameValues.indexOf(x.EntranceName) < 0) {
                        scope.invalidEntranceNameValues.push(x.EntranceName);
                    }

                    if (GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.MeetLocation)) {
                        scope.emptyMeetLocationError = true;
                    } else if (scope.meetLocationValues.indexOf(x.MeetLocation) < 0
                        && scope.invalidMeetLocationValues.indexOf(x.MeetLocation) < 0) {
                        scope.invalidMeetLocationValues.push(x.MeetLocation);
                    }

                    if (GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.ZoneCode)) {
                        scope.emptyZoneCodeError = true;
                    } else if (scope.zoneCodes.indexOf(x.ZoneCode) < 0
                        && scope.invalidZoneCodes.indexOf(x.ZoneCode) < 0) {
                        scope.invalidZoneCodes.push(x.ZoneCode);
                    }
                });
            }

            var getEntranceIDByName = (name: string): string => {
                var result = scope.availableEntrances.filter(x => x.Name === name);
                if (result.length > 0) {
                    return result[0].ID;
                }
                return null;
            };

            var getZoneIDByCode = (code: string): string => {
                var result = scope.availableZones.filter(x => x.Code === code);
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
                    || GenericUtils.isUndefinedOrNull(scope.entranceNames)
                    || GenericUtils.isUndefinedOrNull(scope.meetLocationValues)
                    || GenericUtils.isUndefinedOrNull(scope.zoneCodes)) {
                    return;
                }

                var activeSheet: kendo.spreadsheet.Sheet = scope.spreadsheet.activeSheet();

                if (scope.entranceNames.length > 0) {
                    activeSheet.range("D2:D" + scope.maxRowsCount).validation({
                        dataType: "list",
                        showButton: true,
                        comparerType: "list",
                        from: getValidatorKendoList(scope.entranceNames), // '{ "A1", "A2", "A3", ....... }'
                        allowNulls: false,
                        type: "reject", // kendo bug: revert does not update the datasource
                        messageTemplate: "Invalid entrance name."
                    });
                }

                if (scope.meetLocationValues.length > 0) {
                    activeSheet.range("E2:E" + scope.maxRowsCount).validation({
                        dataType: "list",
                        showButton: true,
                        comparerType: "list",
                        from: getValidatorKendoList(scope.meetLocationValues), // '{ "Club", "Gate", "PreCheck" }'
                        allowNulls: false,
                        type: "warning",
                        messageTemplate: "Invalid meet location code."
                    });
                }

                if (scope.zoneCodes.length > 0) {
                    activeSheet.range("F2:F" + scope.maxRowsCount).validation({
                        dataType: "list",
                        showButton: true,
                        comparerType: "list",
                        from: getValidatorKendoList(scope.zoneCodes), // '{ "Alpha First", "Bravo Club", "Charlie Middle", .... }'
                        allowNulls: false,
                        type: "reject",
                        messageTemplate: "Invalid zone code."
                    });
                }

                //console.log("Validators updated");
                setLoadingProgress(false);
                enableSave(spreadsheetHasChanges());
            };

            var updateEntranceNames = () => {
                var deferred = self.$q.defer();

                if (!!scope.operatingLocationIdParam) {
                    self.entranceRepository.getByOperatingLocationID(scope.operatingLocationIdParam)
                        .then((data: EntranceDTO[]) => {
                            scope.availableEntrances = [];
                            scope.entranceNames = [];
                            data.sort((a, b) => (a.Name < b.Name ? -1 : 1));
                            data.forEach((x: EntranceDTO) => {
                                scope.availableEntrances.push(x);
                                scope.entranceNames.push(x.Name);
                            });
                            //console.log("Entrances read completed");
                            setRangeValidators();
                            deferred.resolve();
                        });
                }
                else {
                    deferred.reject("Invalid operating location");
                }

                return deferred.promise;
            };

            var updateMeetLocationValues = () => {
                var deferred = self.$q.defer();

                if (!!scope.operatingLocationIdParam) {
                    scope.meetLocationValues = [];

                    self.definedListRepository.fetch("MeetLocationIntake", AppConfig.APIHOST)
                        .then((data: DefinedListDTO[]) => {
                            data.sort((a, b) => (a.Value < b.Value ? -1 : 1));
                            data.forEach((x: DefinedListDTO) => {
                                scope.meetLocationValues.push(x.Value);
                            });

                            self.definedListRepository.fetch("MeetLocationIntakeOffice", AppConfig.APIHOST)
                                .then((data: DefinedListDTO[]) => {
                                    data.sort((a, b) => (a.Value < b.Value ? -1 : 1));
                                    data.forEach((x: DefinedListDTO) => {
                                        scope.meetLocationValues.push(x.Value);
                                    });

                                    self.definedListRepository.fetch("MeetLocationGiveBack", AppConfig.APIHOST)
                                        .then((data: DefinedListDTO[]) => {
                                            data.sort((a, b) => (a.Value < b.Value ? -1 : 1));
                                            data.forEach((x: DefinedListDTO) => {
                                                scope.meetLocationValues.push(x.Value);
                                            });

                                            //console.log("Meet locations read completed");
                                            setRangeValidators();
                                            deferred.resolve();
                                        });
                                });
                        });
                }
                else {
                    deferred.reject("Invalid operating location");
                }

                return deferred.promise;
            };

            var updateZoneCodes = () => {
                var deferred = self.$q.defer();

                if (!!scope.operatingLocationIdParam) {
                    self.zoneRepository.getByOperatingLocationID(scope.operatingLocationIdParam)
                        .then((data: ZoneDTO[]) => {
                            scope.availableZones = [];
                            scope.zoneCodes = [];
                            data.sort((a, b) => (a.Code < b.Code ? -1 : 1));
                            data.forEach((x: ZoneDTO) => {
                                scope.availableZones.push(x);
                                scope.zoneCodes.push(x.Code);
                            });
                            //console.log("Zones read completed");
                            setRangeValidators();
                            deferred.resolve();
                        });
                }
                else {
                    deferred.reject("Invalid operating location");
                }

                return deferred.promise;
            };

            var changeHandler = (e) => {
                // Note: this code originally used the datasource hasChanges method to set the disabled state for the save button.
                // However, setting the validators adds all the empty rows to the datasource, which then causes hasChanges to return
                // true. Tried using the datasource remove method to remove these newly added rows from the datasource (which does 
                // not remove them from the spreadsheet), but it was *very* slow, whereas using the filter does not seem noticable.
                // Also note that we can't just read the datasource to refresh after the validators are set, because that will
                // wipe out user changes in the cases where they changed one or more rows and then opted to add a new valid
                // value for one of the columns.
                // Refactor: could disable changeHandler when setting validators.
                var dataRows = getAllRowsWithVisibleData();
                var hasChanges = spreadsheetHasChanges();
                if (anyErrorIndicatorsSet()) {
                    scope.$evalAsync(() => validateRows(dataRows));
                }

                enableSave(!isLoading && hasChanges);
            };

            const schema = {
                model: {  // EntranceMeetLocationZoneSpreadsheetDTO
                    id: "EntranceID",
                    fields: {
                        EntranceID: { type: "string", editable: false },
                        OperatingLocationID: { type: "string", editable: false },
                        ZoneID: { type: "string", editable: false },
                        EntranceName: { type: "string", validation: { required: true } },
                        MeetLocation: { type: "string" },
                        ZoneCode: { type: "string" }
                    }
                }
            };

            const readCommand = {
                url: AppConfig.APIHOST + "Entrance/GetSpreadsheetByOperatingLocationID/" + scope.operatingLocationIdParam,
                type: "get",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                },
                complete: () => {
                    //console.log("Spreadsheet read completed");
                    if (GenericUtils.isUndefinedOrNull(scope.spreadsheet)) {
                        // First read completed.
                        // Note that the pattern of using a fetch and then initialize causes the
                        // spreadsheet data to be loaded twice during page loading. This pattern
                        // will only read the data once during page loading.
                        scope.spreadsheet = $("#spreadsheet").data("kendoSpreadsheet");
                        setRangeValidators();
                    }
                }
            };

            scope.insertNewMeetLocation = (meetLocation: string, index: number) => {
                setLoadingProgress(true);
                self.definedListRepository.insertDefinedListValue("MeetLocationIntake", meetLocation)
                    .then((success) => {
                        if (success) {
                            updateMeetLocationValues().then(() => {
                                //console.log("Meet location insert completed");
                                scope.invalidMeetLocationValues.splice(index, 1);
                                setLoadingProgress(false);
                            });
                        } else {
                            setLoadingProgress(false);
                        }
                    });
            };

            scope.onSave = () => {
                if ($("#save").hasClass("k-state-disabled") || isLoading) {
                    return;
                }

                enableSave(false);

                var rowsToSave = getAllRowsWithVisibleData();

                validateRows(rowsToSave);

                if (!anyErrorIndicatorsSet()) {
                    rowsToSave.forEach(x => {
                        x.EntranceID = getEntranceIDByName(x.EntranceName);
                        x.ZoneID = getZoneIDByCode(x.ZoneCode);
                        x.OperatingLocationID = scope.operatingLocationIdParam;
                    });
                    setLoadingProgress(true);
                    self.entranceRepository
                        .updateFromOperatingLocationSpreadsheet(scope.operatingLocationIdParam, rowsToSave)
                        .then((success) => {
                            //console.log("Spreadsheet update completed");
                            if (success) {
                                scope.dataSourceSpreadsheet.read()
                                    .then(() => setLoadingProgress(false));
                            } else {
                                setLoadingProgress(false);
                            }
                        });
                }
            };

            scope.dataSourceSpreadsheet = AppCommon.KendoDataSourceFactory.createKendoDataSource(CommonConfiguration_Routing.EntranceRoute, schema, null, readCommand, null, null, null, null, changeHandler);

            scope.dataSourceSpreadsheet.options.batch = true;

            scope.sheetOptions = {
                toolbar: {
                    home: [
                        // for all available options, see the toolbar items configuration on Kendo docs:
                        // http://docs.telerik.com/kendo-ui/api/javascript/ui/spreadsheet#configuration-toolbar
                        // http://docs.telerik.com/kendo-ui/api/javascript/ui/toolbar#configuration-items
                        {
                            type: "button",
                            text: "Refresh",
                            icon: "refresh",
                            click: () => {
                                scope.$evalAsync(() => resetErrorIndicators());
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
                activeSheet: "Entrances Mapping",
                sheets: [
                    {
                        name: "Entrances Mapping",
                        dataSource: scope.dataSourceSpreadsheet, // EntranceMeetLocationZoneSpreadsheetDTO
                        frozenRows: 1,
                        rows: [{
                            height: 30,
                            cells: [ // header titles
                                {
                                    index: 3, value: "Entrance Name", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }, {
                                    index: 4, value: "Meet Location", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }, {
                                    index: 5, value: "Zone Code", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }]
                        }],
                        columns: [
                            {
                                width: 0   // EntranceID (hidden)
                            }, {
                                width: 0   // OperatingLocationID
                            }, {
                                width: 0   // ZoneID
                            }, {
                                width: 200 // EntranceName
                            }, {
                                width: 200 // MeetLocation
                            }, {
                                width: 300 // ZoneCode
                            }
                        ]
                    }
                ]
            };

            // init
            $(document).ready(() => {
                scope.$evalAsync(() => {
                    updateEntranceNames();
                    updateZoneCodes();
                    updateMeetLocationValues();
                });
            });
        };
    }

    angular.module("app.staff")
        .directive("entranceMeetLocationZoneMapping",
        [
            "$stateParams", "$q", "SessionService", "AuthService", "KendoDataSourceService", "EntranceRepository", "DefinedListRepository", "ZoneRepository",
            (st, q, s, auth, kds, ep, dl, z) => new EntranceMeetLocationZoneMappingDirective(st, q, s, auth, kds, ep, dl, z)
        ]);
}