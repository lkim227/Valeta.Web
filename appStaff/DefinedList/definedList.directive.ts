module AppStaff {
    import GenericUtils = AppCommon.GenericUtils;

    export interface IDefinedListAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IDefinedListScope extends ng.IScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;

        maxRowsCount: number;
        sheetOptions: any;

        emptyListNameError: boolean;
        emptyValueError: boolean;
        invalidListNames: string[];

        onSave(): void;
    }

    class DefinedListDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.definedListTemplateUrl;
        scope = {
        };

        static $inject = ["$q", "SessionService", "AuthService", "KendoDataSourceService", "DefinedListRepository"];

        constructor(private $q: ng.IQService,
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private kendoService: AppCommon.KendoDataSourceService,
            private definedListRepository: AppCommon.DefinedListRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IDefinedListScope, elements: ng.IAugmentedJQuery, attrs: IDefinedListAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");
            var accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.systemSetup);
            var hasEditAccess = accessLevel >= AccessLevel.Edit;

            scope.canCreate = getBooleanAttribute(attrs.canCreate) && hasEditAccess;
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate) && hasEditAccess;
            scope.canDelete = getBooleanAttribute(attrs.canDelete) && hasEditAccess;

            scope.maxRowsCount = 1000;

            var listNames = (Object.keys(SupportedDefinedLists)
                .map(key => SupportedDefinedLists[key])
                .filter(value => typeof value === 'string') as string[])
                .sort((a, b) => (a < b ? -1 : 1));

            // ReSharper disable once JoinDeclarationAndInitializerJs
            var dataSourceSpreadsheet: any; // kendo.data.DataSource
            var spreadsheet: kendo.ui.Spreadsheet;

            var resetErrorIndicators = () => {
                scope.emptyListNameError = false;
                scope.emptyValueError = false;
                scope.invalidListNames = [];
            }
            resetErrorIndicators();

            var anyErrorIndicatorsSet = (): boolean => {
                var hasErrors = scope.emptyListNameError ||
                    scope.emptyValueError ||
                    scope.invalidListNames.length > 0;
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

            var setRangeValidators = (): void => {
                if (listNames.length > 0) {
                    spreadsheet.activeSheet().range("C2:C" + scope.maxRowsCount).validation({
                        dataType: "list",
                        showButton: true,
                        comparerType: "list",
                        from: AppCommon.KendoFunctions.getValidatorKendoList(listNames), // '{ "Airline", "State", "Color", ....... }'
                        allowNulls: false,
                        type: "reject", // kendo bug: revert does not update the datasource
                        messageTemplate: "Invalid list name."
                    });
                }
            };

            var rowHasVisibleData = (row): boolean => {
                return !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(row.ListName)
                    || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(row.Value)
                    || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(row.Description);
            }

            var modifiedRows: any = [];
            var deletedRows: any = [];
            var setRowLists = (): void => {
                modifiedRows = dataSourceSpreadsheet.data().filter(row => (row.dirty || row.isNew()) && rowHasVisibleData(row));

                var deletedByDeleteCommand = dataSourceSpreadsheet.destroyed();
                var deletedByDeletingVisibleData = dataSourceSpreadsheet.data().filter(row => !row.isNew() && !rowHasVisibleData(row));
                deletedRows = deletedByDeleteCommand.concat(deletedByDeletingVisibleData);
            }

            var spreadsheetHasChanges = (): boolean => {
                return modifiedRows.length > 0 || deletedRows.length > 0;
            }

            var validateModifiedRows = () => {
                resetErrorIndicators();
                modifiedRows.forEach(row => {
                    if (GenericUtils.isUndefinedNullEmptyOrWhiteSpace(row.ListName)) {
                        scope.emptyListNameError = true;
                    } else if (listNames.indexOf(row.ListName) < 0 && scope.invalidListNames.indexOf(row.ListName) < 0) {
                        // Need to check for invalid ListName even with reject validation as copy/paste will not trigger validation
                        scope.invalidListNames.push(row.ListName);
                    };

                    if (GenericUtils.isUndefinedNullEmptyOrWhiteSpace(row.Value)) {
                        scope.emptyValueError = true;
                    }
                });
            }

            var changeHandler = () => {
                // See EntranceMeetLocationZoneMappingDirective for notes on pattern
                setRowLists();
                var hasChanges = spreadsheetHasChanges();
                if (anyErrorIndicatorsSet()) {
                    scope.$evalAsync(() => validateModifiedRows());
                }
                enableSave(!isLoading && hasChanges);
            };

            scope.onSave = () => {
                if ($("#save").hasClass("k-state-disabled") || isLoading) {
                    return;
                }

                enableSave(false);

                setRowLists();
                validateModifiedRows();

                if (!anyErrorIndicatorsSet()) {
                    deletedRows.forEach((item, index) => {
                        item.IsArchived = true;
                    });
                    var rowsToSave = modifiedRows.concat(deletedRows);

                    if (rowsToSave.length > 0) {
                        setLoadingProgress(true);
                        self.definedListRepository.updateFromSpreadsheet(rowsToSave)
                            .then((success) => {
                                if (success) {
                                    dataSourceSpreadsheet.read()
                                        .then(() => setLoadingProgress(false));
                                } else {
                                    setLoadingProgress(false);
                                }
                            });
                    }
                }
            }

            //build datasource
            const schema = {
                model: {  // DefinedListDTO
                    id: "ID",
                    fields: {
                        ID: { type: "string", editable: false },
                        IsArchived: { type: "boolean" },
                        ListName: { type: "string", validation: { required: true } },
                        Value: { type: "string", validation: { required: true } },
                        Description: { type: "string" },
                        IsPreferred: { type: "boolean" }
                    }
                }
            };

            const readCommand = {
                url: AppConfig.APIHOST + "DefinedList/GetAll",
                type: "get",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                },
                complete: () => {
                    if (GenericUtils.isUndefinedOrNull(spreadsheet)) {
                        // First read completed. See EntranceMeetLocationZoneMappingDirective for notes on pattern.
                        spreadsheet = $("#spreadsheet").data("kendoSpreadsheet");
                        setRangeValidators();
                        setLoadingProgress(false);
                    }
                }
            };
            dataSourceSpreadsheet = AppCommon.KendoDataSourceFactory
                .createKendoDataSource("DefinedList", schema, null, readCommand, null, null, null, null, changeHandler);
            dataSourceSpreadsheet.options.batch = true;

            scope.sheetOptions = {
                toolbar: {
                    home: [
                        {
                            type: "button",
                            text: "Refresh",
                            icon: "refresh",
                            click: () => {
                                scope.$evalAsync(() => resetErrorIndicators());
                                setLoadingProgress(true);
                                dataSourceSpreadsheet.read()
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
                activeSheet: "Defined Lists",
                sheets: [
                    {
                        name: "Defined Lists",
                        dataSource: dataSourceSpreadsheet, // DefinedListDTO
                        frozenRows: 1,
                        rows: [{
                            height: 30,
                            cells: [ // header titles ... value does not seem to have any effect
                                {
                                    index: 2, value: "List Name", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }, {
                                    index: 3, value: "Value", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }, {
                                    index: 4, value: "Description", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }, {
                                    index: 5, value: "Preferred?", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }
                            ]
                        }],
                        columns: [ // sheets.columns configuration is very limited http://docs.telerik.com/kendo-ui/api/javascript/ui/spreadsheet#configuration-sheets.columns
                            {
                                width: 0   // ID (hidden)
                            }, {
                                width: 0   // IsArchived (hidden)
                            }, {
                                width: 200   // ListName
                            }, {
                                width: 200 // Value
                            }, {
                                width: 200 // Description
                            }, {                               
                                width: 120 // IsPreferred
                            }
                        ]
                    }
                ]
            };
        };
    }

    angular.module("app.staff")
        .directive("definedList",
        ["$q", "SessionService", "AuthService", "KendoDataSourceService", "DefinedListRepository",
            (q, s, a, ks, dl) => new DefinedListDirective(q, s, a, ks, dl)]);
}