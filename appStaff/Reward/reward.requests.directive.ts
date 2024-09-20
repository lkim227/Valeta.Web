module AppStaff {
    export interface IRewardRequestsAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IRewardRequestsScope extends ng.IScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;

        formMessages: any;

        showCompleted(): void;

        gridOptions: any;
        pointsAccountingRepository: AppCommon.PointsAccountingRepository;
    }

    class RewardRequests implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommon.AppCommonConfig.kendoGridBaseUrl;
        scope = {
        
        };

        static $inject = ["SessionService", "PointsAccountingRepository"];

        constructor(private sessionService: AppCommon.SessionService,
            private paRepository: AppCommon.PointsAccountingRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IRewardRequestsScope, elements: ng.IAugmentedJQuery, attrs: IRewardRequestsAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;
            scope.pointsAccountingRepository = this.paRepository;

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
                        ReservationID: { editable: false },
                        ReservationNumber: { editable: false },
                        AccountID: { editable: false },
                        AccountName: { editable: false },
                        RewardID: { editable: false },
                        RewardQuantity: { type: "number", editable: false },
                        RewardName: { editable: false },
                        Points: { type: "number", editable: false },
                        Created: { type: "date", editable: false },
                        CreatedBy: { editable: false },
                        DateProcessed: { type: "date", editable: false },
                        ProcessedBy: { editable: false },
                        OfficeNote: {},
                        NoteToCustomer: {},
                        Status: { editable: false }
                    }
                }
            };
            var readCommand = {
                url: AppConfig.APIHOST + "PointsAccounting/GetAllPendingExtended",
                type: "get",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                }
            };
            var updateCommand = {
                url: AppConfig.APIHOST + "PointsAccounting/UpdateNotes",
                type: "put",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                }
            };
            var dataSource = AppCommon.KendoDataSourceFactory.createKendoDataSource("PointsAccounting", schema, null, readCommand, updateCommand);
            dataSource.sort([
                { field: "Created", dir: "asc" }
            ]);

            //textarea editors
            var officeNoteEditor = (container, options) => {
                $('<textarea class="k-textbox" rows="5" name="' + options.field + '" data-bind="value : OfficeNote"/>')
                    .appendTo(container);
            };
            var noteToCustomerEditor = (container, options) => {
                $('<textarea class="k-textbox" rows="5" name="' + options.field + '" data-bind="value : NoteToCustomer"/>')
                    .appendTo(container);
            };

            //build grid
            var filterable = "false";
            var columns = [
                { field: "ID", hidden: true },
                { field: "RewardID", hidden: true },
                { field: "Created", title: "Date Requested", format: "{0:d}" },
                { field: "RewardName", title: "Reward" },
                { field: "RewardQuantity", title: "Qty" },
                { field: "AccountName", title: "Customer", width: "130px" },
                { field: "OfficeNote", title: "Office Note", width: "250px", editor: officeNoteEditor },
                { field: "NoteToCustomer", title: "Note to Customer", width: "250px", editor: noteToCustomerEditor },
                {
                    command: {
                        text: "Complete",
                        click: function(kendoEvent) {
                            kendoEvent.preventDefault();

                            var dataitem = this.dataItem($(kendoEvent.currentTarget).closest("tr"));

                            scope.pointsAccountingRepository.changeRewardStatus(dataitem.ID, "completed", self.sessionService.userInfo.employeeFriendlyID)
                                .then((success) => {
                                    if (success) {
                                        console.log(dataitem.RewardName + " is updated");
                                        dataSource.read();
                                    }
                                });
                        }
                    },
                    title: " ",
                    width: "120px",
                    hidden: !scope.canUpdate
                }
            ];
            scope.gridOptions = AppCommon.KendoFunctions.getGridOptions(
                dataSource,
                "PointsAccounting",
                scope.canCreate,
                scope.canUpdate,
                filterable,
                columns);
        };
    }

    angular.module("app.staff")
        .directive("rewardRequests",
            ["SessionService", "PointsAccountingRepository", (s, paRepo) => new RewardRequests(s, paRepo)]);
}