module AppStaff {
    import GenericUtils = AppCommon.GenericUtils;

    export interface IEntranceAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IEntranceScope extends ng.IScope {
        operatingLocationIdParam: string;

        accessLevel: AccessLevel;
        hasEditAccess: boolean;

        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        canSave: boolean;

        formMessages: any;

        maxRowsCount: number;
        dataSourceSpreadsheet: any; // kendo.data.DataSource --> EntranceDTO[]
        spreadsheet: kendo.ui.Spreadsheet;
        sheetOptions: any;

        onSave(): void;

        invalidRows: any;
    }

    class EntranceDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.entranceTemplateUrl;
        scope = {
            //selectedOperatingLocationId: "=?"
        };

        static $inject = ["$stateParams", "SessionService", "AuthService", "EntranceRepository"];

        constructor(private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private entranceRepository: AppCommon.EntranceRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IEntranceScope, elements: ng.IAugmentedJQuery, attrs: IEntranceAttrs, ngModelCtrl: ng.INgModelController) => {
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
            scope.maxRowsCount = 1000;

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
                    !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.Name)))));
            }

            scope.onSave = () => {
                if ($("#save").hasClass("k-state-disabled") || isLoading) {
                    return;
                }

                enableSave(false);

                var modifiedRows = getModifiedRows();
                var deletedRows = scope.dataSourceSpreadsheet.destroyed();
                deletedRows.forEach((item, index) => {
                    item.IsArchived = true;
                });

                var entrancesToSave = modifiedRows.concat(deletedRows);

                if (scope.canSave && entrancesToSave.length > 0) {
                    entrancesToSave.forEach(x => x.OperatingLocationID = scope.operatingLocationIdParam);
                    setLoadingProgress(true);
                    self.entranceRepository.updateFromEntranceSpreadsheet(scope.operatingLocationIdParam, entrancesToSave)
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
                var entrances = scope.dataSourceSpreadsheet.data().length;
                var rowCount = scope.spreadsheet.options.rows;

                if (entrances > 0) {
                    // add custom string validator for 'Entrance name' cells
                    for (var i = 2; i < rowCount; i++) {
                        const cell = "E" + i;
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
                model: { // EntranceDTO
                    id: "ID",
                    fields: {
                        ID: { type: "string", editable: false },
                        IsArchived: { type: "boolean", editable: false, default: "false" },
                        OperatingLocationID: { type: "string" },
                        MeetLocationToZoneMappings: {},
                        Name: { type: "string", validation: { required: true } }
                    }
                }
            };

            const readCommand = {
                url: AppConfig.APIHOST + "Entrance/GetByOperatingLocationID/" + scope.operatingLocationIdParam,
                type: "get",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                }
            };

            var changeHandler = () => {
                var modifiedRows = getModifiedRows();
                var deletedRows = scope.dataSourceSpreadsheet.destroyed();

                scope.canSave = false;
                scope.invalidRows = modifiedRows.filter(x => !x.Name || !(x.Name.length > 0));

                if ((modifiedRows.length + deletedRows.length) > 0 && scope.invalidRows.length === 0) {
                    scope.canSave = true;
                }

                scope.$evalAsync(() => enableSave(!isLoading && scope.canSave));
                scope.$apply();
            };

            scope.dataSourceSpreadsheet = AppCommon.KendoDataSourceFactory.createKendoDataSource(CommonConfiguration_Routing.EntranceRoute, schema, null, readCommand, null, null, null, null, changeHandler);

            scope.dataSourceSpreadsheet.fetch(() => {
                setLoadingProgress(false);
                scope.spreadsheet = $("#spreadsheet").data("kendoSpreadsheet");

                //customize spreadsheet here...
                setRangeValidators();
                setLoadingProgress(false);
            });

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
                activeSheet: "Entrances",
                sheets: [
                    {
                        name: "Entrances",
                        dataSource: scope.dataSourceSpreadsheet,
                        frozenRows: 1,
                        rows: [{
                            height: 30,
                            cells: [ // header titles
                                {
                                    index: 4, value: "Entrance Name", bold: "true", fontSize: 18, background: "#ffd009", textAlign: "center", enable: false
                                }]
                        }],
                        columns: [
                            {
                                width: 0  // ID (hidden)
                            }, {
                                width: 0  // ISArchived
                            }, {
                                width: 0  // OperatingLocationID
                            }, {
                                width: 0  // MeetLocationToZoneMappings
                            }, {
                                width: 200 // Name
                            }
                        ]
                    }
                ]
            };
        };
    }

    angular.module("app.staff")
        .directive("entrance",
        [
            "$stateParams", "SessionService", "AuthService", "EntranceRepository",
            (st, s, auth, ep) => new EntranceDirective(st, s, auth, ep)
        ]);
}