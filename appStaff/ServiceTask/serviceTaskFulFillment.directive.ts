module AppStaff {
    export interface IServiceTaskFulfillmentAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
        showCompleted: string;
        showDeleted: string;
        serviceQueryMethodName: string;
    }

    export interface IServiceTaskFulfillmentScope extends ng.IScope {
        onChangeOperatingLocation(newOperatingLocation: OperatingLocationDTO): void;
        ticketNumberParam: number;
        selectedTicket: AirportTicketQueryResult;
        notifyBillingSummary: boolean;
        onSelectedTicket: boolean;
        selectedOperatingLocationID: string;
        createdBy: string;
        accessLevel: AccessLevel;
        hasEditAccess: boolean;
        editType: string;

        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        showCompleted: boolean;
        showDeleted: boolean;
        serviceQueryMethodName: string;

        taskModal: any;
        refreshData(): void;
        addNewTask(): void;
        openAddTask(): void;
        cancelAddTask(): void;
        formMessages: any;
        addTaskWindow: kendo.ui.Window;
        findTicketInfo(): void;
        showForm: boolean;
        showNotFoundTicketMessage: boolean;
        setCSSClassForStatus(status: number): string;
        toggleShowCompleted(): void;
        toggleShowDeleted(): void;

        newTask: ServiceTaskQueryResult;
        dataSource: kendo.data.DataSource;
        gridOptions: any;
        buildKendoGrid(): void;

        statusList: kendo.data.DataSource;
        employeeList: kendo.data.DataSource;
        categoryList: kendo.data.DataSource;
        serviceList: kendo.data.DataSource;
        constructUpdateCommand(dataitem: any): UpdateServiceTaskCommandDTO;
        onChange(e: any): void;
    }

    class ServiceTaskFulfillmentDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaff.ConfigureForASFContext.serviceTaskFulfillmentTemplateUrl;
        scope = {
            selectedTicket: "=",
            notifyBillingSummary: "=?"
        };

        static $inject = ["$stateParams", "SessionService", "ErrorHandlingService", "ServiceTaskCommand", "DispatcherAirportTicketQuery", "AuthService", "$uibModal"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private errorService: AppCommon.ErrorHandlingService,
            private serviceTaskCommand: AppCommon.ServiceTaskCommand,
            private ticketRepository: AppCommon.DispatcherAirportTicketQuery,
            private authService: AppCommon.AuthService,
            private $uibModal) {
        }

        link: ng.IDirectiveLinkFn = (scope: IServiceTaskFulfillmentScope, elements: ng.IAugmentedJQuery, attrs: IServiceTaskFulfillmentAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;

            scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.serviceFulfillment);
            scope.hasEditAccess = scope.accessLevel >= AccessLevel.Edit;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canCreate = getBooleanAttribute(attrs.canCreate);
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate);
            scope.canDelete = getBooleanAttribute(attrs.canDelete);
            scope.showCompleted = getBooleanAttribute(attrs.showCompleted);
            scope.showDeleted = getBooleanAttribute(attrs.showDeleted);
            scope.serviceQueryMethodName = attrs.serviceQueryMethodName;

            scope.ticketNumberParam = this.$stateParams["ticketNumber"];
            scope.onSelectedTicket = !!scope.ticketNumberParam;
            scope.selectedOperatingLocationID = null;
            scope.newTask = new ServiceTaskQueryResult();
            scope.newTask.TicketNumber = scope.ticketNumberParam;
            scope.showForm = false;
            scope.showNotFoundTicketMessage = false;
            scope.createdBy = this.sessionService.userInfo.employeeFriendlyID;

            if (scope.canUpdate && scope.hasEditAccess) {
                scope.editType = "incell";
            } else {
                scope.editType = "false";
            }

            //get categories
            scope.categoryList = AppCommon.KendoFunctions.getDefinedListAsKendoDataSource("ServiceCategory");
            var categoryEditor = (container, options) => {
                $('<input id="categorySelector" data-bind="value : Category"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        dataSource: scope.categoryList,
                        optionLabel: "--None--",
                        dataTextField: "Description",
                        dataValueField: "Value",
                        valuePrimitive: true
                    });
            };

            scope.findTicketInfo = () => {
                if (!!scope.newTask.TicketNumber) {
                    //fill-in info from ticket
                    self.ticketRepository.getByTicketNumber(scope.newTask.TicketNumber.toString())
                        .then(data => {
                            if (!!data) {
                                scope.newTask.TicketNumber = data.TicketNumber;
                                if (!!data.ActiveAirportMeet) {
                                    scope.newTask.ExpectedIntakeDateTime = data.ActiveAirportMeet.IntakeDateTimeCustomerMeetsValet;
                                    if (!!data.ActiveAirportMeet.GiveBackSpecifications) scope.newTask.ExpectedGiveBackDateTime = data.ActiveAirportMeet.GiveBackSpecifications.DateUsedToCalculateMeetTime;
                                }
                                scope.newTask.OperatingLocationID = data.OperatingLocationID;
                                scope.newTask.CustomerID = data.Customer.AccountID;
                                if (!!data.Customer.Name) scope.newTask.CustomerName = data.Customer.Name.FriendlyName;
                                if (!!data.Customer.MobilePhone) scope.newTask.MobilePhone = data.Customer.MobilePhone.Number;
                                if (!!data.Customer.Email) scope.newTask.EmailAddress = data.Customer.Email.EmailAddress;
                                if (!!data.Vehicle) {
                                    scope.newTask.VehicleLicensePlate = data.Vehicle.LicensePlate;
                                    scope.newTask.VehicleFriendlyName = data.Vehicle.FriendlyName;
                                }
                                scope.newTask.ReservationNote = data.ReservationNote;
                                scope.newTask.SlotCode = data.SlotCode;
                                scope.newTask.KeysLocation = data.KeysLocation;
                                scope.newTask.Group = "0"; //CatchaAll=0 by convention
                                scope.showNotFoundTicketMessage = false;
                                scope.showForm = true;
                            }
                            else {
                                scope.showNotFoundTicketMessage = true;
                                self.errorService.removePageErrors(); // error already shown on modal
                            }
                        });
                }
                else {
                    scope.showForm = false;
                }
            }

            scope.constructUpdateCommand = (dataitem: any): UpdateServiceTaskCommandDTO => {
                var command = new UpdateServiceTaskCommandDTO();
                command.ID = dataitem.ID;
                command.CreatedBy = scope.createdBy;
                command.OfferedServiceID = dataitem.OfferedServiceID;
                command.ServiceName = dataitem.ServiceName;
                command.Category = dataitem.Category;
                command.ServiceTaskStatus = dataitem.ServiceTaskStatus;
                command.EmployeeID = dataitem.EmployeeID;
                command.EmployeeFriendlyID = dataitem.EmployeeFriendlyID;
                command.ServiceFee = dataitem.ServiceFee;
                command.ServiceTaskNote = dataitem.ServiceTaskNote;
                command.ProviderCharge = dataitem.ProviderCharge;
                command.SlotCode = dataitem.SlotCode;
                command.KeysLocation = dataitem.KeysLocation;
                command.TaxRate = dataitem.TaxRate;
                command.TicketNumber = dataitem.TicketNumber;
                command.Group = "0"; //todo: should choose between CatchAll = 0 & Allowance = 1

                return command;
            };

            scope.setCSSClassForStatus = (status: number): string => {
                var style = "";
                switch (status) {
                    case 0:
                    case 10:
                        style = "alert-danger"; // red
                        break;
                    case 1:
                    case 2:
                        style = "alert-warning"; // yellow
                        break;
                    case 3:
                    case 4:
                    case 11:
                        style = "alert-success"; // green
                        break;
                }

                return style;
            }

            scope.refreshData = () => {
                scope.dataSource.read().then(() => {
                    var grid = $("#asfGrid").data("kendoGrid");
                    grid.setDataSource(scope.dataSource);
                    grid.refresh();
                    scope.notifyBillingSummary = true;
                });
            }

            scope.addNewTask = () => {
                if (!!scope.newTask.TicketNumber) {
                    self.ticketRepository.getByTicketNumber(scope.newTask.TicketNumber.toString())
                        .then(data => {
                            if (!!data) {
                                var command = new CreateServiceTaskCommandDTO();
                                command.ID = AppCommon.GuidService.NewGuid();
                                command.CreatedBy = scope.createdBy;
                                //GeoLocation

                                command.ServiceName = scope.newTask.ServiceName;
                                command.Category = scope.newTask.Category;
                                
                                command.TicketNumber = data.TicketNumber;

                                command.ServiceFee = scope.newTask.ServiceFee;
                                command.ProviderCharge = scope.newTask.ProviderCharge;
                                command.ServiceTaskNote = scope.newTask.ServiceTaskNote;

                                command.DepartureDateTimeCustomerMeetsValet = data.ActiveAirportMeet.IntakeDateTimeCustomerMeetsValet;
                                command.ReturnDateTime = data.ActiveAirportMeet.GiveBackSpecifications.DateUsedToCalculateMeetTime;
                                command.OperatingLocationID = data.OperatingLocationID;
                                command.CustomerID = data.Customer.AccountID;
                                command.CustomerName = data.Customer.Name.FriendlyName;
                                command.MobilePhone = data.Customer.MobilePhone.Number;
                                command.EmailAddress = data.Customer.Email.EmailAddress;
                                command.VehicleLicensePlate = data.Vehicle.LicensePlate;
                                command.VehicleFriendlyName = data.Vehicle.FriendlyName;
                                command.ReservationNote = data.ReservationNote;

                                command.TaxRate = scope.newTask.TaxRate;

                                command.SlotCode = data.SlotCode;
                                command.KeysLocation = data.KeysLocation;

                                command.Group = scope.newTask.Group;

                                self.serviceTaskCommand.doCommand(command)
                                    .then(() => {
                                        scope.refreshData();

                                        scope.cancelAddTask();
                                    });
                            }
                        });
                }
            };

            scope.openAddTask = () => {
                scope.taskModal = this.$uibModal.open({
                    templateUrl: 'addTaskModalContent',
                    size: 'md',
                    scope: scope
                });
            };

            scope.cancelAddTask = () => {
                scope.taskModal.close();
                scope.showForm = false;
                if (!!scope.ticketNumberParam) {
                    scope.showForm = true;
                }
                // reset
                scope.newTask = new ServiceTaskQueryResult();
                scope.newTask.TicketNumber = scope.ticketNumberParam;
                scope.findTicketInfo();
            };

            var filterDataSource = () => {
                if (scope.showCompleted && scope.showDeleted) {
                    scope.dataSource.filter([]);
                } else if (scope.showCompleted) {
                    scope.dataSource.filter([
                        { field: "ServiceTaskStatus", operator: "neq", value: ServiceTaskStatus.Deleted }
                    ]);
                } else if (scope.showDeleted) {
                    scope.dataSource.filter([
                        { field: "ServiceTaskStatus", operator: "neq", value: ServiceTaskStatus.Completed }
                    ]);
                } else {
                    scope.dataSource.filter([
                        { field: "ServiceTaskStatus", operator: "neq", value: ServiceTaskStatus.Completed },
                        { field: "ServiceTaskStatus", operator: "neq", value: ServiceTaskStatus.Deleted }
                    ]);
                }
            }

            scope.toggleShowCompleted = (): void => {
                scope.showCompleted = !scope.showCompleted;
                filterDataSource();
            }

            scope.toggleShowDeleted = (): void => {
                scope.showDeleted = !scope.showDeleted;
                filterDataSource();
            }

            scope.onChange = (e: any): void => {
                if (e.field === "EmployeeID") {
                    var changed = e.items.filter(x => x.dirty === true)[0];
                    var emp = scope.employeeList.data().toJSON().filter(x => x.ID === changed.EmployeeID)[0];
                    if (!!emp) {
                        changed.set("EmployeeFriendlyID", emp.FriendlyID);
                    }
                    else {
                        changed.set("EmployeeFriendlyID", null);
                    }

                    //scope.dataSource.sync(); // autosave
                }
                // not used yet
                if (e.field === "OfferedServiceID") {
                    var changed2 = e.items.filter(x => x.dirty === true)[0];
                    var service = scope.serviceList.data().toJSON().filter(x => x.ID === changed2.OfferedServiceID)[0];
                    if (!!service) {
                        changed2.set("ServiceName", service.ServiceName);
                        changed2.set("Category", service.Category);
                    }
                    else {
                        changed2.set("ServiceName", null);
                        changed2.set("Category", null);
                    }

                    //scope.dataSource.sync(); // autosave
                }
                scope.notifyBillingSummary = true;
            }

            scope.onChangeOperatingLocation = (newOperatingLocation: OperatingLocationDTO): void => {
                if (newOperatingLocation == null) {
                    scope.selectedOperatingLocationID = undefined;
                    return;
                }
                scope.selectedOperatingLocationID = newOperatingLocation.ID;

                scope.buildKendoGrid();
            };

            scope.buildKendoGrid = (): void => {
                if (!!scope.selectedOperatingLocationID) {
                    //build datasource
                    var urlString = AppConfig.APIHOST + ServiceTaskConfiguration_Routing.QueryRoute + "/" + scope.serviceQueryMethodName + "/" + scope.selectedOperatingLocationID;   //ServiceTaskConfiguration_Routing_QueryMethods.GetFulfillmentQueue 
                    if (!!scope.ticketNumberParam) {
                        urlString = AppConfig.APIHOST + ServiceTaskConfiguration_Routing.QueryRoute + "/" + ServiceTaskConfiguration_Routing_QueryMethods.GetByTicketNumber + "/" + scope.ticketNumberParam;
                        scope.findTicketInfo();
                    }

                    var schema = {
                        model: {
                            id: "ID",
                            fields: {
                                ID: { editable: false },
                                TicketNumber: { editable: false },
                                OfferedServiceID: {},
                                ServiceName: {},
                                Category: {},
                                EmployeeID: {},
                                EmployeeFriendlyID: {},
                                ServiceTaskStatus: { type: "number" },
                                ServiceFee: { type: "number" },
                                ServiceTaskFulfillmentNote: {},
                                ProviderCharge: { type: "number" },
                                ExpectedIntakeDateTime: { type: "date", editable: false },
                                ExpectedGiveBackDateTime: { type: "date", editable: false },
                                OperatingLocationID: {},
                                CustomerName: { editable: false },
                                MobilePhone: { editable: false },
                                EmailAddress: { editable: false },
                                VehicleLicensePlate: { editable: false },
                                VehicleFriendlyName: { editable: false },
                                ReservationNote: { editable: false },
                                SlotCode: {},
                                KeysLocation: {},
                                Group: {},
                                TaxRate: { type: "number" }
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
                            data.EmployeeID = AppCommon.KendoFunctions.findEmployeeIDInKendoDataSource(data.EmployeeID, scope.employeeList);
                        }
                        if (operation !== "read") {
                            return JSON.stringify(data);
                        }

                        return data;
                    };
                    var updateCommand = {
                        url: AppConfig.APIHOST + ServiceTaskConfiguration_Routing.CommandRoute + "/" + ServiceTaskConfiguration_Routing_CommandMethods.UpdateServiceTaskQueryResult,
                        type: "put",
                        dataType: "json",
                        contentType: "application/json",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                        },
                        complete: function (e) {
                            // scope.dataSource.read();
                        }
                    };

                    var errorHandler = (e: any) => {
                        var error = e.xhr.statusText + ": " + e.xhr.responseJSON.ExceptionMessage;
                        self.errorService.showPageError(error);
                    };

                    scope.dataSource = AppCommon.KendoDataSourceFactory.createKendoDataSource(ServiceTaskConfiguration_Routing.QueryRoute, schema, parameterMap, readCommand, updateCommand, null, null, errorHandler, null);
                    filterDataSource();
                    scope.dataSource.fetch(() => {
                        // force to rerender table when OL changes
                        scope.refreshData();
                    });

                    scope.dataSource.sort([
                        { field: "ExpectedGiveBackDateTime", dir: "asc" },
                        { field: "TicketNumber", dir: "asc" },
                        { field: "Category", dir: "asc" },
                        { field: "ServiceName", dir: "asc" }
                    ]);

                    //get status enum as a list
                    scope.statusList = AppCommon.KendoFunctions.getEnumAsKendoDataSource(ServiceTaskStatus, [ServiceTaskStatus.Deleted, ServiceTaskStatus.Completed]);
                    var statusEditor = (container, options) => {
                        $('<input id="statusSelector" data-bind="value : ServiceTaskStatus"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                dataSource: scope.statusList,
                                dataTextField: "Description",
                                dataValueField: "Value",
                                valuePrimitive: true
                            });
                    };

                    //get employees list by roles
                    //var allowedRoles = ["Service Department Manager", "Service Department Helper"];
                    //var urlEmployees = AppConfig.APIHOST + "UsersInRole/List?roleNames=" + allowedRoles.join(",");
                    var urlEmployees = AppConfig.APIHOST + ServiceTaskConfiguration_Routing.QueryRoute + "/" + ServiceTaskConfiguration_Routing_QueryMethods.GetEmployeesToAssignTaskTo + "/" + scope.selectedOperatingLocationID;
                    scope.employeeList = AppCommon.KendoFunctions.getEmployees(urlEmployees);
                    var employeeEditor = (container, options) => {
                        $('<input id="employeeSelector" data-bind="value : EmployeeID"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                dataSource: scope.employeeList,
                                dataTextField: "FriendlyID",
                                dataValueField: "ID",
                                valuePrimitive: true,
                                optionLabel: "--None--"
                            });
                    };

                    //get offered services list
                    scope.serviceList = AppCommon.KendoFunctions.getOfferedServices(AppConfig.APIHOST + "OfferedService/GetAll");
                    var serviceEditor = (container, options) => {
                        $('<input id="serviceSelector" data-bind="value : OfferedServiceID"/>')
                            .appendTo(container)
                            .kendoDropDownList({
                                dataSource: scope.serviceList,
                                dataTextField: "ServiceName",
                                dataValueField: "ID",
                                valuePrimitive: true,
                                optionLabel: "--None--"
                            });
                    };

                    var todayDate = new Date();
                    var filterable = "true";
                    
                    //textarea editors
                    var serviceNameEditor = (container, options) => {
                        $('<textarea class="k-textbox" rows="5" name="' + options.field + '" data-bind="value : ServiceName"/>')
                            .appendTo(container);
                    };
                    var serviceTaskNoteEditor = (container, options) => {
                        $('<textarea class="k-textbox" rows="5" name="' + options.field + '" data-bind="value : ServiceTaskNote"/>')
                            .appendTo(container);
                    };

                    //build grid
                    var columns = [
                        {
                            field: "ServiceTaskStatus",
                            title: "Status",
                            editor: statusEditor,
                            template:
                                `<div ng-class="setCSSClassForStatus(dataItem.ServiceTaskStatus)">
                                    #= AppCommon.GenericUtils.camelToTitle(AppCommon.EnumUtils.getNameForValueServiceTaskStatus(ServiceTaskStatus)) #
                                </div>`,
                            width: "120px",
                            filterable: false
                        },
                        {
                            field: "ServiceTaskStatus",
                            command: {
                                text: "Done",
                                click: function (kendoEvent) {
                                    kendoEvent.preventDefault();

                                    const dataitem = this.dataItem($(kendoEvent.currentTarget).closest("tr"));
                                    const id = dataitem.ID;

                                    if (!!id) {
                                        var response = confirm("Are you sure you want to complete '" + dataitem.ServiceName + "' task for #" + dataitem.TicketNumber + "?");
                                        if (response === false) {
                                            return;
                                        }

                                        var command = new UpdateServiceTaskCommandDTO(); // self.constructUpdateCommand(dataitem)
                                        command.ID = dataitem.ID;
                                        command.CreatedBy = scope.createdBy;
                                        command.ServiceName = dataitem.ServiceName;
                                        command.Category = dataitem.Category;
                                        command.ServiceTaskStatus = dataitem.ServiceTaskStatus;
                                        command.EmployeeID = dataitem.EmployeeID;
                                        command.EmployeeFriendlyID = dataitem.EmployeeFriendlyID;
                                        command.ServiceFee = dataitem.ServiceFee;
                                        command.ServiceTaskNote = dataitem.ServiceTaskNote;
                                        command.ProviderCharge = dataitem.ProviderCharge;
                                        command.SlotCode = dataitem.SlotCode;
                                        command.KeysLocation = dataitem.SlotCode;
                                        command.TaxRate = dataitem.TaxRate;
                                        command.TicketNumber = dataitem.TicketNumber;
                                        command.Group = dataitem.Group;
                                        self.serviceTaskCommand.doCommand(command)
                                            .then(() => {
                                                var command = new CompleteServiceTaskCommandDTO();
                                                command.ID = id;
                                                command.CreatedBy = scope.createdBy;
                                                command.ServiceName = dataitem.ServiceName;
                                                command.ProviderCharge = dataitem.ProviderCharge;
                                                command.ServiceFee = dataitem.ServiceFee;
                                                command.ServiceTaskNote = dataitem.ServiceTaskNote;
                                                command.TicketNumber = dataitem.TicketNumber;
                                                command.Group = dataitem.Group;

                                                self.serviceTaskCommand.doCommand(command)
                                                    .then(() => {
                                                        scope.dataSource.read();
                                                    });
                                            });
                                    }
                                }
                            },
                            title: "&nbsp;", width: "120px", hidden: !scope.canUpdate
                        },
                        {
                            field: "TicketNumber",
                            title: "Ticket #",
                            template: '<a class="link" href="/appStaff/\\#/ticket/#=TicketNumber#" target="_self">#=TicketNumber#</a>' + 
                            '</br><a class="link" href="/appStaff/\\#/service-task/#=ID#" target="_self">this service</a>',
                            width: "60px",
                            hidden: scope.onSelectedTicket
                        },
                        {
                            field: "TicketNumber",
                            title: "",
                            template: '<a class="link" href="/appStaff/\\#/service-task/#=ID#" target="_self">details</a>',
                            width: "60px",
                            hidden: !scope.onSelectedTicket
                        },
                        {
                            field: "ExpectedIntakeDateTime",
                            title: "Intake",
                            template: "#= kendo.toString(kendo.parseDate(ExpectedIntakeDateTime), \"g\") #",
                            hidden: scope.onSelectedTicket
                        },
                        {
                            field: "ExpectedGiveBackDateTime",
                            title: "GiveBack",
                            template: "#= kendo.toString(kendo.parseDate(ExpectedGiveBackDateTime), \"g\") #",
                            hidden: scope.onSelectedTicket
                        },
                        {
                            field: "CustomerName",
                            title: "Customer",
                            width: "120px",
                            template: "<a class='link' href='/appStaff/\\#/account-profile/#=CustomerID#' target='_self'>{{ dataItem.CustomerName }}</a>" +
                                '<br/> <span>#=EmailAddress#</span>' +
                                '<br/>#=MobilePhone#&nbsp;&nbsp;<a class="link" href="#=AppCommon.CommunicationUtils.buildAdHocCommunicationUrl(AppCommon.CommunicationUtils.referenceContextIssue)#/#=ID#/#=MobilePhone#/#=CustomerName#" target="_self">SMS</a><br/>',
                            hidden: scope.onSelectedTicket
                        },
                        {
                            field: "ServiceName",
                            title: "Service",
                            editor: serviceNameEditor,
                            width: "300px",
                            headerAttributes: {
                                style: "white-space: normal"
                            }
                        },
                        { field: "Category", title: "Category", editor: categoryEditor },
                        {
                            field: "ServiceTaskNote",
                            title: "Note",
                            editor: serviceTaskNoteEditor
                        },
                        { field: "SlotCode", title: "Slot", filterable: false, hidden: scope.onSelectedTicket },
                        {
                            field: "EmployeeID",
                            title: "Assigned to",
                            editor: employeeEditor,
                            filterable: false, 
                            template: "#= !!EmployeeFriendlyID ? EmployeeFriendlyID : '' #"
                        },
                        { field: "ServiceFee", title: "Fee", type: "number", format: "{0:c2}", filterable: false },
                        { field: "TaxRate", title: "Tax Rate %", type: "number", filterable: false },
                        { field: "ProviderCharge", title: "Provider", type: "number", format: "{0:c2}", filterable: false },
                        {
                            field: "VehicleFriendlyName",
                            title: "Vehicle",
                            width: "120px",
                            template: `<div>
                                      {{ !!dataItem.VehicleFriendlyName ? dataItem.VehicleFriendlyName : '' }}
                                      <br/><i> {{ !!dataItem.VehicleLicensePlate ? dataItem.VehicleLicensePlate : '' }} </i>
                                  </div>`,
                            hidden: scope.onSelectedTicket
                        },
                        { field: "ReservationNote", title: "Reservation Note", hidden: scope.onSelectedTicket },
                        {
                            field: "OfferedServiceID",
                            title: "Service Reference",
                            editor: serviceEditor, // dropdown of available OfferedServices (car wash, oil change, flowers, etc..)
                            template: "#= !!OfferedServiceID ? ServiceName : '' #",
                            hidden: true
                        }
                    ];

                    scope.gridOptions = AppCommon.KendoFunctions.getGridOptions(
                        scope.dataSource,
                        ServiceTaskConfiguration_Routing.QueryRoute,
                        false, // add is handle via special window
                        scope.canUpdate && scope.hasEditAccess,
                        filterable,
                        columns,
                        null,
                        scope.editType);

                    scope.dataSource.bind("change", (e) => scope.onChange(e));
                }
            }

        };

    }

    angular.module("app.staff")
        .directive("serviceTaskFulfillment",
        [
            "$stateParams", "SessionService", "ErrorHandlingService", "ServiceTaskCommand", "DispatcherAirportTicketQuery", "AuthService", "$uibModal",
            (sp, s, err, astc, d, a, uib) => new ServiceTaskFulfillmentDirective(sp, s, err, astc, d, a, uib)
        ]);
}