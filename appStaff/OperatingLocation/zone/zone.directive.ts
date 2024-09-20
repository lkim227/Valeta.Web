module AppStaff {
    import GenericUtils = AppCommon.GenericUtils;

    export interface IZoneAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IZoneScope extends AppCommon.IListViewDirectiveBaseScope {
        operatingLocationIdParam: string;

        accessLevel: AccessLevel;
        hasEditAccess: boolean;
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        canSave: boolean;

        formMessages: any;

        maxRowsCount: number;
        dataSourceSpreadsheet: any; // kendo.data.DataSource --> ZoneDTO[]
        spreadsheet: kendo.ui.Spreadsheet;
        sheetOptions: any;

        onSave(): void;

        invalidRows: any;
    }

    class ZoneDirective extends AppCommon.ListViewDirectiveBase {
        restrict = "E";
        templateUrl = AppStaffConfig.zoneTemplateUrl;
        scope = {

        };

        static $inject = ["$stateParams", "SessionService", "AuthService", "KendoDataSourceService", "ZoneRepository"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private kendoDataSourceService: AppCommon.KendoDataSourceService,
            private zoneRepository: AppCommon.ZoneRepository) {
            super();
        }


        link: ng.IDirectiveLinkFn = (scope: IZoneScope, elements: ng.IAugmentedJQuery, attrs: AppCommon.IListViewDirectiveBaseAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;

            var getBooleanValue = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.systemSetup);
            scope.hasEditAccess = scope.accessLevel >= AccessLevel.Edit;

            scope.canCreate = getBooleanValue(attrs.canCreate) && scope.hasEditAccess;
            scope.canUpdate = getBooleanValue(attrs.canUpdate) && scope.hasEditAccess;
            scope.canDelete = getBooleanValue(attrs.canDelete) && scope.hasEditAccess;
            scope.canSave = false;

            scope.operatingLocationIdParam = self.$stateParams["operatingLocationId"];
            scope.invalidRows = [];
            scope.maxRowsCount = 500;

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

            var getModifiedRows = (): any => {
                return scope.dataSourceSpreadsheet.data().filter(x =>
                    x.dirty && (
                        !x.isNew()
                        || (x.isNew() && (
                            !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.Code)
                            || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.Description)
                                    || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.InstructionsIntakeNoBaggage)
                                    || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.InstructionsIntakeWithBaggage)
                                    || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.InstructionsGiveBackNoBaggage)
                                    || !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.InstructionsGiveBackWithBaggage)))));
            }

            scope.onSave = () => {
                if ($("#save").hasClass("k-state-disabled") || isLoading) {
                    return;
                }

                enableSave(false);

                var deletedRows = scope.dataSourceSpreadsheet.destroyed();
                if (deletedRows.length > 0) {
                    var list = deletedRows.map((x) => {return GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.Code) ? "(unknown)" : x.Code});
                    if (!confirm(`The following zone(s) will be deleted, along with all associated Entrance/Zone and Lot/Zone mappings: ${list.join(", ")}
Are you sure you want to continue?`)) {
                        enableSave(true);
                        return;
                    }
                }

                deletedRows.forEach((item, index) => {
                    item.IsArchived = true;
                });

                var modifiedRows = getModifiedRows();

                var zonesToSave = modifiedRows.concat(deletedRows);

                if (scope.canSave && zonesToSave.length > 0) {
                    zonesToSave.forEach(x => x.OperatingLocationID = scope.operatingLocationIdParam);
                    setLoadingProgress(true);
                    self.zoneRepository.updateFromZoneSpreadsheet(scope.operatingLocationIdParam, zonesToSave)
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


            var setRangeValidators = (): void => {
                var activeSheet: kendo.spreadsheet.Sheet = scope.spreadsheet.activeSheet();
                var zones = scope.dataSourceSpreadsheet.data().length;
                var rowCount = scope.spreadsheet.options.rows;

                if (zones > 0) {
                    // add custom string validator for 'Zone name' cells
                    for (var i = 2; i < rowCount; i++) {
                        const cell = "C" + i;
                        activeSheet.range(cell).validation({
                            dataType: "custom",
                            from: "NOT(ISBLANK(" + cell + "))",
                            allowNulls: false, // not empty
                            type: "reject",
                            messageTemplate: "Field name is required."
                        });
                    }
                }
            };

            //build datasource
            const schema = {
                model: { // ZoneDTO
                    id: "ID",
                    fields: {
                        ID: { type: "string", editable: false },
                        IsArchived: { type: "boolean", editable: false, default: "false" },
                        Code: { type: "string", validation: { required: true } },
                        Description: { type: "string" },
                        OperatingLocationID: { type: "string", editable: false },
                        InstructionsIntakeNoBaggage: { type: "string" },
                        InstructionsIntakeWithBaggage: { type: "string" },
                        InstructionsGiveBackNoBaggage: { type: "string" },
                        InstructionsGiveBackWithBaggage: { type: "string" },
                        InstructionsGiveBackOverride: { type: "string" },
                        OrderedLotIDs: {},
                        GridRow: { type: "number" },
                        GridColumn: { type: "number" },
                        Style: { }
                    }
                }
            };

            const readCommand = {
                url: AppConfig.APIHOST + "Zone/GetByOperatingLocationID/" + scope.operatingLocationIdParam,
                type: "get",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                }
            };

            var changeHandler = () => {
                var modifiedRows = getModifiedRows();
                var deletedRows = scope.dataSourceSpreadsheet.destroyed();

                scope.canSave = false;
                scope.invalidRows = modifiedRows.filter(x => !x.Code || !(x.Code.length > 0));

                if ((modifiedRows.length + deletedRows.length) > 0 && scope.invalidRows.length === 0) {
                    scope.canSave = true;
                }

                enableSave(!isLoading && scope.canSave);
            };

            scope.dataSourceSpreadsheet = AppCommon.KendoDataSourceFactory.createKendoDataSource("Zone", schema, null, readCommand, null, null, null, null, changeHandler);
            scope.dataSourceSpreadsheet.fetch(() => {
                scope.spreadsheet = $("#spreadsheet").data("kendoSpreadsheet");

                //customize spreadsheet here...
                setRangeValidators();
                setLoadingProgress(false);
            });

            scope.dataSourceSpreadsheet.options.batch = true;

            scope.sheetOptions = {
                toolbar: {
                    home: [{
                        type: "button",
                        text: "Refresh",
                        icon: "refresh",
                        click: () => {
                            setLoadingProgress(true);
                            scope.dataSourceSpreadsheet.read()
                                .then(() => setLoadingProgress(false));
                        }
                    }],
                    insert: false,
                    data: false
                },
                sheetsbar: false,
                rows: scope.maxRowsCount, // default 200
                columns: 13, // default 50
                activeSheet: "Zones",
                sheets: [
                    {
                        name: "Zones",
                        dataSource: scope.dataSourceSpreadsheet,
                        frozenRows: 1,
                        rows: [{
                            height: 30,
                            cells: [ // header titles
                                {
                                    index: 2, value: "Zone Code", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }, {
                                    index: 3, value: "Description", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }, {
                                    index: 5, value: "Intake No Baggage", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }, {
                                    index: 6, value: "Intake With Baggage", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }, {
                                    index: 7, value: "Back No Baggage", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }, {
                                    index: 8, value: "Back With Baggage", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }, {
                                    index: 9, value: "Back Override", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }]
                        }],
                        columns: [
                            {
                                width: 0  // ID (hidden)
                            }, {
                                width: 0  // ISArchived
                            }, {
                                width: 150  // Code
                            }, {
                                width: 150  // Description
                            }, {
                                width: 0 // OperatingLocationID
                            }, {
                                width: 250 // InstructionsIntakeNoBaggage
                            }, {
                                width: 250 // InstructionsIntakeWithBaggage
                            }, {
                                width: 250 // InstructionsGiveBackNoBaggage
                            }, {
                                width: 250 // InstructionsGiveBackWithBaggage
                            }, {
                                width: 250 // InstructionsGiveBacOverride
                            }, {
                                width: 0 // OrderedLotIDs
                            }, {
                                width: 0 // GridRow
                            }, {
                                width: 0 // GridColumn
                            }, {
                                width: 0 // Style
                            }
                        ]
                    }
                ]
            };
        };
    }

    angular.module("app.staff")
        .directive("zone",
        ["$stateParams", "SessionService", "AuthService", "KendoDataSourceService", "ZoneRepository",
            (st, s, auth, ks, z) => new ZoneDirective(st, s, auth, ks, z)]);
}