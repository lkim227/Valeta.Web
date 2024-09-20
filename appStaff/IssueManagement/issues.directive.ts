module AppStaff {
    export interface IIssueManagementIssuesAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IIssueManagementIssuesScope extends ng.IScope {
        onChangeOperatingLocation(newOperatingLocation: OperatingLocationDTO): void;
        ticketNumberParam: string;
        customerAccountIDParam: string;
        selectedTicket: AirportTicketQueryResult;
        onSelectedTicket: boolean;
        onSelectedCustomer: boolean;
        selectedOperatingLocationID: string;
        createdBy: string;
        accessLevel: AccessLevel;
        hasEditAccess: boolean;
        editType: string;

        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;

        buildGrid(): void;

        addIssueModal: any;
        addNewIssue(): void;
        openAddIssue(): void;
        cancelAddIssue(): void;
        formMessages: any;

        addIssueForm: ng.IFormController;
        onSelectReference(selected: OmnisearchQueryResult): void;

        issuesDataSource: kendo.data.DataSource; 
        newIssue: IssueQueryResult;
        gridOptions: any;

        selectedCategory: any;
        selectedEmployee: any;
        statusList: kendo.data.DataSource;
        employeeList: kendo.data.DataSource;
        issueCategoryList: kendo.data.DataSource;

        addNoteModal: any;
        addNewNote(): void;
        openNewNote(): void;
        cancelNewNote(): void;
        addNewNoteForm: ng.IFormController;
        newNote: string;
        currentIssueId: string;
        currentIssueName: string;
        setCurrentIssueId(currentIssueId: string, currentIssueName: string): void;
        onChangeAssignedIssue(e: any): void;
    }

    class IssueManagementIssuesDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaff.ConfigureForIMContext.issuesTemplateUrl;
        scope = {
            selectedTicket: "="
        };

        static $inject = ["$stateParams", "SessionService", "AuthService", "ErrorHandlingService", "IssueManagementCommand", "DispatcherAirportTicketQuery", "AccountRepository", "$uibModal"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private errorService: AppCommon.ErrorHandlingService,
            private issueManagementCommand: IssueManagementCommand,
            private ticketRepository: AppCommon.DispatcherAirportTicketQuery,
            private accountRepository: AppCommon.AccountRepository,
            private $uibModal) {
        }

        link: ng.IDirectiveLinkFn = (scope: IIssueManagementIssuesScope, elements: ng.IAugmentedJQuery, attrs: IIssueManagementIssuesAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;

            scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.issues);
            scope.hasEditAccess = scope.accessLevel >= AccessLevel.Edit;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canCreate = getBooleanAttribute(attrs.canCreate);
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate);
            scope.canDelete = getBooleanAttribute(attrs.canDelete);
            scope.createdBy = self.sessionService.userInfo.employeeFriendlyID;

            if (scope.canUpdate && scope.hasEditAccess) {
                scope.editType = "incell";
            } else {
                scope.editType = "false";
            }

            scope.ticketNumberParam = this.$stateParams["ticketNumber"];
            scope.onSelectedTicket = !!scope.ticketNumberParam;
            scope.selectedOperatingLocationID = null;

            scope.customerAccountIDParam = this.$stateParams["customerIdentifier"];
            scope.onSelectedCustomer = !!scope.customerAccountIDParam;

            scope.newIssue = new IssueQueryResult();
            scope.newIssue.ReferenceNumber = scope.ticketNumberParam;
            scope.newIssue.OperatingLocationID = scope.selectedOperatingLocationID;

            scope.addNewIssue = () => {
                if (!!scope.newIssue.ReferenceNumber) {
                    var command = new CreateIssueCommandDTO();
                    command.ID = AppCommon.GuidService.NewGuid();
                    command.CreatedBy = scope.createdBy;
                    command.Name = scope.newIssue.Name;
                    command.Description = scope.newIssue.Description;
                    command.ReferenceNumber = scope.newIssue.ReferenceNumber;
                    command.AccountID = scope.newIssue.AccountID;
                    command.CustomerName = scope.newIssue.CustomerName;
                    command.MobilePhone = scope.newIssue.MobilePhone;
                    command.EmailAddress = scope.newIssue.EmailAddress;
                    command.OperatingLocationID = scope.newIssue.OperatingLocationID;
                    command.Category = scope.newIssue.Category;
                    if (!!scope.selectedEmployee && !!scope.selectedEmployee.FriendlyID) {
                        command.AssignedEmployeeID = scope.selectedEmployee.ID;
                        command.AssignedEmployeeFriendlyID = scope.selectedEmployee.FriendlyID;
                    }
                    self.issueManagementCommand.doCommand(command)
                        .then(() => {
                            scope.issuesDataSource.read();
                            scope.cancelAddIssue();
                        });
                }
            };
            scope.openAddIssue = () => {
                scope.addIssueModal = this.$uibModal.open({
                    templateUrl: 'addIssueModalContent',
                    size: 'md',
                    scope: scope
                });
            };
            scope.cancelAddIssue = () => {
                scope.addIssueModal.close();

                scope.newIssue = new IssueQueryResult();
                scope.newIssue.ReferenceNumber = scope.ticketNumberParam;
                scope.newIssue.OperatingLocationID = scope.selectedOperatingLocationID;
                scope.selectedCategory = null;
                scope.selectedEmployee = null;
                scope.newNote = null;

                if (!!scope.addIssueForm) {
                    scope.addIssueForm.$setPristine();
                    scope.addIssueForm.$setUntouched();
                }
            };

            scope.onChangeAssignedIssue = (e: any): void => {
                if (e.field == "AssignedEmployeeID") {
                    var changed = e.items.filter(x => x.dirty == true)[0];
                    var emp = scope.employeeList.data().toJSON()
                        .filter(x => x.ID === changed.AssignedEmployeeID)[0];
                    if (!!emp) {
                        changed.set("AssignedEmployeeFriendlyID", emp.FriendlyID);
                    }
                    else {
                        changed.set("AssignedEmployeeFriendlyID", null);
                    }

                    scope.issuesDataSource.sync(); // autosave
                }
            }

            scope.buildGrid = () => {
                //build datasource
                var urlString = AppConfig.APIHOST + IssueManagementConfiguration_Routing.QueryRoute + "/" + IssueManagementConfiguration_Routing_QueryMethods.GetActiveQueue + "/" + scope.selectedOperatingLocationID;
                if (scope.onSelectedTicket) {
                    urlString = AppConfig.APIHOST + IssueManagementConfiguration_Routing.QueryRoute + "/" + IssueManagementConfiguration_Routing_QueryMethods.GetByReference + "/" + scope.ticketNumberParam;
                }
                if (scope.onSelectedCustomer) {
                    urlString = AppConfig.APIHOST + IssueManagementConfiguration_Routing.QueryRoute + "/" + IssueManagementConfiguration_Routing_QueryMethods.GetByAccountID + "/" + scope.customerAccountIDParam;
                }

                var schema = {
                    model: {
                        id: "ID",
                        fields: {
                            ID: { editable: false },
                            Name: {},
                            Status: {},
                            Description: {},
                            Category: {},
                            ReferenceNumber: { editable: false },
                            CustomerName: { editable: false },
                            MobilePhone: { editable: false },
                            EmailAddress: { editable: false },
                            OperatingLocationID: {},
                            AssignedEmployeeID: {},
                            AssignedEmployeeFriendlyID: {},
                            IssueNotes: {}
                        }
                    }
                };
                var readCommand = {
                    url: urlString,
                    type: "get",
                    dataType: "json",
                    contentType: "application/json",
                    beforeSend: req => {
                        req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                    }
                };
                var parameterMap = (data, operation) => {
                    if (operation === "update") {
                        data.AssignedEmployeeID = AppCommon.KendoFunctions
                            .findEmployeeIDInKendoDataSource(data.AssignedEmployeeFriendlyID, scope.employeeList);
                    }
                    if (operation !== "read") {
                        return JSON.stringify(data);
                    }
                    return data;
                };
                var updateCommand = {
                    url: AppConfig.APIHOST + IssueManagementConfiguration_Routing.QueryRoute + "/" + IssueManagementConfiguration_Routing_CommandMethods.UpdateIssueQueryResult,
                    type: "post",
                    dataType: "json",
                    contentType: "application/json",
                    beforeSend: req => {
                        req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                    },
                    complete: function (e) {
                        //scope.dataSource.read();
                    }
                };

                var errorHandler = (e: any) => {
                    var error = e.xhr.statusText + ": " + e.xhr.responseJSON.ExceptionMessage;
                    self.errorService.showPageError(error);
                };

                scope.issuesDataSource = AppCommon.KendoDataSourceFactory.createKendoDataSource(IssueManagementConfiguration_Routing.QueryRoute, schema, parameterMap, readCommand, updateCommand, null, null, errorHandler, null);
                scope.issuesDataSource.fetch(() => {
                    // force to rerender table when OL changes
                    var grid = $("#issuesGrid").data("kendoGrid");
                    grid.setDataSource(scope.issuesDataSource);
                    grid.refresh();
                });

                scope.issuesDataSource.sort([
                    { field: "ReferenceNumber", dir: "asc" },
                    { field: "Name", dir: "asc" }
                ]);

                //get status enum as a list
                scope.statusList = AppCommon.KendoFunctions.getEnumAsKendoDataSource(IssueStatus, [IssueStatus.Cancelled, IssueStatus.Completed]);
                var statuses = (container, options) => {
                    $('<input id="statusSelector" data-bind="value : Status"/>')
                        .appendTo(container)
                        .kendoDropDownList({
                            dataSource: scope.statusList,
                            dataTextField: "Description",
                            dataValueField: "Value",
                            valuePrimitive: true
                        });
                };

                //get categories
                scope.issueCategoryList = AppCommon.KendoFunctions.getDefinedListAsKendoDataSource("IssueCategory");
                var definedListIssueCategory = (container, options) => {
                    $('<input id="categorySelector" data-bind="value : Category"/>')
                        .appendTo(container)
                        .kendoDropDownList({
                            dataSource: scope.issueCategoryList,
                            dataTextField: "Description",
                            dataValueField: "Value",
                            valuePrimitive: true
                        });
                };

                //get employees list by roles
                var urlEmployees = AppConfig.APIHOST + IssueManagementConfiguration_Routing.QueryRoute + "/" + IssueManagementConfiguration_Routing_QueryMethods.GetEmployeesToAssignIssueTo + "/" + scope.selectedOperatingLocationID;

                scope.employeeList = AppCommon.KendoFunctions.getEmployees(urlEmployees);
                var employees = (container, options) => {
                    $('<input id="employeeSelector" data-bind="value : AssignedEmployeeID"/>')
                        .appendTo(container)
                        .kendoDropDownList({
                            dataSource: scope.employeeList,
                            dataTextField: "FriendlyID",
                            dataValueField: "ID",
                            valuePrimitive: true,
                            optionLabel: "--None--"
                        });
                };

                //adding new note
                scope.setCurrentIssueId = (currentIssueId: string, currentIssueName: string) => {
                    scope.currentIssueId = currentIssueId;
                    scope.currentIssueName = currentIssueName;
                    scope.newNote = null;
                };
                scope.addNewNote = () => {
                    if (!!scope.currentIssueId && !!scope.newNote && scope.newNote.length > 0) {
                        var command = IssueManagementSupport.buildAddIssueNoteCommand(scope.currentIssueId, scope.newNote, scope.createdBy);
                        self.issueManagementCommand.doCommand(command)
                            .then(() => {
                                scope.issuesDataSource.read();
                                scope.cancelNewNote();
                            });
                    }
                };
                scope.openNewNote = () => {
                    scope.addNoteModal = this.$uibModal.open({
                        templateUrl: 'addNewNoteModalContent',
                        size: 'md',
                        scope: scope
                    });
                };
                scope.cancelNewNote = () => {
                    scope.currentIssueId = null;
                    scope.newNote = null;
                    scope.addNoteModal.close();
                };

                //textarea editors
                var nameEditor = (container, options) => {
                    $('<textarea class="k-textbox" rows="5" name="' + options.field + '" data-bind="value : Name"/>')
                        .appendTo(container);
                };
                var descriptionEditor = (container, options) => {
                    $('<textarea class="k-textbox" rows="5" name="' + options.field + '" data-bind="value : Description"/>')
                        .appendTo(container);
                };

                //build grid
                var filterable = "true";
                var columns = [
                    {
                        field: "ID",
                        title: " ",
                        width: "80px",
                        filterable: false,
                        template: '<a class="link" href="/appStaff/\\#/issue/#=ID#">Details</a><br/>'
                    },
                    {
                        field: "ReferenceNumber",
                        title: "Ticket #",
                        template:
                        '<a class="link" href="/appStaff/\\#/ticket/#=ReferenceNumber#" target="_self">\\##=ReferenceNumber#</a><br/>',
                        hidden: true // scope.onSelectedTicket 
                    },
                    {
                        field: "Category",
                        title: "Category",
                        editor: definedListIssueCategory
                    },
                    {
                        field: "AssignedEmployeeID",
                        title: "Assigned to",
                        editor: employees,
                        template: "#= !!AssignedEmployeeFriendlyID ? AssignedEmployeeFriendlyID : '' #"
                    },
                    {
                        field: "Status",
                        title: "Status",
                        editor: statuses,
                        template:
                        "#= AppCommon.GenericUtils.camelToTitle(AppCommon.EnumUtils.getNameForValueIssueStatus(Status)) #",
                        width: "120px",
                        hidden: !scope.canUpdate
                    },
                    {
                        field: "Name",
                        title: "Issue",
                        width: "220px",
                        editor: nameEditor,
                        template: '<span class=\"normal-line-height truncate\" style=\"display: inline-block; width: 220px;\">#=Name#</span>'
                    },
                    {
                        field: "Description",
                        title: "Description",
                        width: "300px",
                        editor: descriptionEditor,
                        template: '<span class=\"normal-line-height truncate\" style=\"display: inline-block; width: 220px;\">#=Description#</span>'
                    },
                    {
                        field: "CustomerName",
                        title: "Customer",
                        width: "230px",
                        template: '<a class="link" href="/appStaff/\\#/account-profile/#=AccountID#" target="_self">#=CustomerName#</a>' +
                            '<br/> <span>#=EmailAddress#</span>' + 
                            '<br/>#=MobilePhone#&nbsp;&nbsp;<a class="link" href="#=AppCommon.CommunicationUtils.buildAdHocCommunicationUrl(AppCommon.CommunicationUtils.referenceContextIssue)#/#=ID#/#=MobilePhone#/#=CustomerName#" target="_self">SMS</a><br/>',
                        filterable: false,
                        hidden: scope.onSelectedTicket || scope.onSelectedCustomer
                    },
                    {
                        field: "ID",
                        title: "Notes",
                        template:
                        "#= (!!IssueNotes && IssueNotes.length > 0) ? '<span class=\"truncate normal-line-height right-buffer5\" style=\"display: inline-block; width: 200px;\" title=\"' + IssueNotes[0].Note  + '\">' + IssueNotes[0].Note + '</span>' : '' #" +
                        "#= (!!IssueNotes && IssueNotes.length > 1) ? '<br><a href=\"/appStaff/\\#/issue/' + ID + '\" class=\"italic right-buffer5\" target=\"_self\">+ ' + (IssueNotes.length-1) + ' more</a>' : '' #" +
                        "<button ng-show=\"hasEditAccess\" class=\"btn btn-sm\" ng-click=\"openNewNote();setCurrentIssueId('#=ID#','#=Name#');\"><span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span> New Note</button>"
                    },
                    {
                        field: "Status",
                        command: {
                            text: "Called Customer",
                            click: function (kendoEvent) {
                                kendoEvent.preventDefault();

                                const dataitem = this.dataItem($(kendoEvent.currentTarget).closest("tr"));
                                const id = dataitem.ID;

                                if (!!id) {
                                    var response =
                                        confirm("Are you sure you want to record 'Called Customer' for Issue '" + dataitem.Name + "'?");
                                    if (response === false) {
                                        return;
                                    }

                                    var command = new RecordCustomerCalledCommandDTO();
                                    command.ID = id;
                                    command.CreatedBy = scope.createdBy;
                                    self.issueManagementCommand.doCommand(command)
                                        .then(() => {
                                            scope.issuesDataSource.read();
                                        });
                                }
                            }
                        },
                        title: "&nbsp;",
                        width: "120px",
                        hidden: !scope.hasEditAccess || !scope.canUpdate
                    },
                    {
                        field: "Status",
                        command: {
                            text: "Complete",
                            click: function (kendoEvent) {
                                kendoEvent.preventDefault();

                                const dataitem = this.dataItem($(kendoEvent.currentTarget).closest("tr"));
                                const id = dataitem.ID;

                                if (!!id) {
                                    var response = confirm("Are you sure you want to complete '" + dataitem.Name +"'?");
                                    if (response === false) {
                                        return;
                                    }

                                    var command = IssueManagementSupport.constructUpdateCommand(dataitem, scope.createdBy);
                                    self.issueManagementCommand.doCommand(command)
                                        .then(() => {
                                            var completeCommand = new CompleteIssueCommandDTO();
                                            completeCommand.ID = id;
                                            completeCommand.CreatedBy = scope.createdBy;

                                            self.issueManagementCommand.doCommand(completeCommand)
                                                .then(() => {
                                                    scope.issuesDataSource.read();
                                                });
                                        });
                                }
                            }
                        },
                        title: "&nbsp;",
                        width: "120px",
                        hidden: !scope.hasEditAccess || !scope.canUpdate
                    },
                    {
                        field: "Status",
                        command: {
                            text: "Cancel",
                            click: function (kendoEvent) {
                                kendoEvent.preventDefault();

                                const dataitem = this.dataItem($(kendoEvent.currentTarget).closest("tr"));
                                const id = dataitem.ID;

                                if (!!id) {
                                    var response = confirm("Are you sure you want to cancel '" +
                                        dataitem.Name +
                                        "' issue for #" +
                                        dataitem.ReferenceNumber +
                                        "?");
                                    if (response === false) {
                                        return;
                                    }

                                    var command = IssueManagementSupport.constructUpdateCommand(dataitem, scope.createdBy);
                                    self.issueManagementCommand.doCommand(command)
                                        .then(() => {
                                            var cancelCommand = new CancelIssueCommandDTO();
                                            cancelCommand.ID = id;
                                            cancelCommand.CreatedBy = scope.createdBy;

                                            self.issueManagementCommand.doCommand(cancelCommand)
                                                .then(() => {
                                                    scope.issuesDataSource.read();
                                                });
                                        });
                                }
                            }
                        },
                        title: "&nbsp;",
                        width: "120px",
                        hidden: !scope.canDelete || !scope.hasEditAccess
                    }
                ];

                scope.gridOptions = AppCommon.KendoFunctions.getGridOptions(
                    scope.issuesDataSource,
                    IssueManagementConfiguration_Routing.QueryRoute,
                    false, //add is handle via special window
                    scope.canUpdate && scope.hasEditAccess,
                    filterable,
                    columns, null, scope.editType);

                scope.issuesDataSource.bind("change", (e) => scope.onChangeAssignedIssue(e));
            }

            scope.onChangeOperatingLocation = (newOperatingLocation: OperatingLocationDTO): void => {

                if (newOperatingLocation == null) {
                    scope.selectedOperatingLocationID = null;
                    return;
                }
                scope.selectedOperatingLocationID = newOperatingLocation.ID;

                scope.buildGrid();
            };

            if (scope.onSelectedCustomer) {
                scope.buildGrid();
            }


            // scope.$watch("selectedIssueReference") NOT WORKING
            scope.onSelectReference = (selected: OmnisearchQueryResult): void => {
                scope.newIssue.ReferenceNumber = selected.FriendlyID;
                scope.newIssue.OperatingLocationID = scope.selectedOperatingLocationID;
                
                if (selected.ResultType == OmnisearchResultType.CustomerCurrentRecord) {
                    self.accountRepository.getByID(selected.ID, AppConfig.APIHOST)
                        .then(data => {
                            if (!!data) {
                                scope.newIssue.AccountID = selected.ID;
                                scope.newIssue.CustomerName = data.ContactInformation.Name.First + ' ' + data.ContactInformation.Name.Last;
                                scope.newIssue.MobilePhone = data.ContactInformation.MobilePhone.Number;
                                scope.newIssue.EmailAddress = data.ContactInformation.Email.EmailAddress;
                            }
                        });
                }

                if (selected.ResultType == OmnisearchResultType.TicketCurrentRecord) {
                    self.ticketRepository.getById(selected.ID)
                        .then(data => {
                            if (!!data) {
                                scope.newIssue.AccountID = data.Customer.AccountID;
                                scope.newIssue.CustomerName = data.Customer.Name.FriendlyName;
                                scope.newIssue.MobilePhone = data.Customer.MobilePhone.Number;
                                scope.newIssue.EmailAddress = data.Customer.Email.EmailAddress;
                                //scope.newIssue.OperatingLocationID = data.OperatingLocationID;
                            }
                        });
                }
            }

        };
    }

    angular.module("app.staff")
        .directive("issues",
        [
            "$stateParams", "SessionService", "AuthService", "ErrorHandlingService", "IssueManagementCommand", "DispatcherAirportTicketQuery", "AccountRepository", "$uibModal",
            (sp, s, auth, err, imc, d, a, $uibModal) => new IssueManagementIssuesDirective(sp, s, auth, err, imc, d, a, $uibModal)
        ]);
}