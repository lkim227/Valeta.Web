module AppStaff {

    export class SingleServiceTaskController extends AppCommon.ControllerBase {
        serviceTaskID: string;
        serviceTask: ServiceTaskQueryResult;
        utils: AppCommon.GenericUtils;
        enumUtils: AppCommon.EnumUtils;
        formMessages: AppCommon.FormMessages;
        currentCommunicationContext: string;
        currentObjectEvents: Array<any>;

        operatingLocation: OperatingLocationDTO;
        ticketReferenceId: string;

        canEdit: boolean;
        isInEditMode: boolean;
        selectedStatus: any;
        selectedEmployee: any;
        statusList: kendo.data.DataSource;
        employeeList: kendo.data.DataSource;
        categoryList: kendo.data.DataSource;

        static $inject = ["$stateParams", "AuthService", "SessionService", "DispatcherAirportTicketQuery", "ServiceTaskQuery", "ServiceTaskCommand", "ServiceTaskEvent"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private authService: AppCommon.AuthService,
            private sessionService: AppCommon.SessionService,
            private airportTicketQuery: AppCommon.DispatcherAirportTicketQuery,
            private serviceTaskRepository: AppCommon.ServiceTaskQuery,
            private ServiceTaskCommand: AppCommon.ServiceTaskCommand,
            private ServiceTaskEvent: ServiceTaskEvent) {

            super(authService);

            this.serviceTaskID = this.$stateParams["serviceTaskID"];
            this.serviceTask = null;
            this.utils = AppCommon.GenericUtils;
            this.enumUtils = AppCommon.EnumUtils;
            this.formMessages = AppCommon.FormMessages;
            this.currentCommunicationContext = AppCommon.CommunicationUtils.referenceContextServiceTask;

            this.getServiceTask();
        }

        getServiceTask = (): void => {
            this.serviceTaskRepository.getByID(this.serviceTaskID)
                .then(data => {
                    if (!!data) {
                        this.serviceTask = data;
                        this.canEdit = this.serviceTask.ServiceTaskStatus !== ServiceTaskStatus.Completed;
                        this.getEvents();
                        this.airportTicketQuery.getByTicketNumber(this.serviceTask.TicketNumber.toString())
                            .then((data) => {
                                if (!!data) {
                                    this.ticketReferenceId = data.ID;
                                }
                        });
                    }
                });
        }

        onEdit = (): void => {
            this.isInEditMode = true;

            //get status enum as a list
            this.statusList = AppCommon.KendoFunctions.getEnumAsKendoDataSource(ServiceTaskStatus, [ServiceTaskStatus.Deleted, ServiceTaskStatus.Completed]);
            $("#statusList").data("kendoComboBox").value(this.serviceTask.ServiceTaskStatus.toString());

            //get categories
            this.categoryList = AppCommon.KendoFunctions.getDefinedListAsKendoDataSource("ServiceCategory");
            //$("#categoryList").data("kendoComboBox").value(this.serviceTask.Category);

            //get employees list
            var urlEmployees = AppConfig.APIHOST + ServiceTaskConfiguration_Routing.QueryRoute + "/" + ServiceTaskConfiguration_Routing_QueryMethods.GetEmployeesToAssignTaskTo + "/" + this.operatingLocation.ID;
            this.employeeList = AppCommon.KendoFunctions.getEmployees(urlEmployees);
            this.selectedEmployee = null;

            if (!!this.serviceTask.EmployeeID) {
                $("#employeeList").data("kendoComboBox").value(this.serviceTask.EmployeeID);
            }
        }

        onUpdate = (): void => {
            this.isInEditMode = false;
            if (!!this.selectedStatus) {
                this.serviceTask.ServiceTaskStatus = this.selectedStatus.Value;
            }
            if (!!this.selectedEmployee) {
                this.serviceTask.EmployeeID = this.selectedEmployee.ID;
                this.serviceTask.EmployeeFriendlyID = this.selectedEmployee.FriendlyID;
            }

            var command = new UpdateServiceTaskCommandDTO(); // self.constructUpdateCommand(dataitem)
            command.ID = this.serviceTask.ID;
            command.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;
            command.ServiceName = this.serviceTask.ServiceName;
            command.Category = this.serviceTask.Category;
            command.ServiceTaskStatus = this.serviceTask.ServiceTaskStatus;
            command.EmployeeID = this.serviceTask.EmployeeID;
            command.EmployeeFriendlyID = this.serviceTask.EmployeeFriendlyID;
            command.ServiceFee = this.serviceTask.ServiceFee;
            command.ServiceTaskNote = this.serviceTask.ServiceTaskNote;
            command.ProviderCharge = this.serviceTask.ProviderCharge;
            command.SlotCode = this.serviceTask.SlotCode;
            command.KeysLocation = this.serviceTask.KeysLocation;
            command.TaxRate = this.serviceTask.TaxRate;
            command.Group = this.serviceTask.Group;
            command.TicketNumber = this.serviceTask.TicketNumber;

            this.ServiceTaskCommand.doCommand(command)
                .then(() => {
                    this.getServiceTask();
                    this.getEvents();
                });
        }

        onCancel = (): void => {
            this.isInEditMode = false;
        }

        complete = (): void => {
            var response = confirm("Are you sure you want to complete '" + this.serviceTask.ServiceName + "'?");
            if (response === false) {
                return;
            }

            var completeCommand = new CompleteServiceTaskCommandDTO();
            completeCommand.ID = this.serviceTask.ID;
            completeCommand.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;
            completeCommand.ServiceName = this.serviceTask.ServiceName;
            completeCommand.ProviderCharge = this.serviceTask.ProviderCharge;
            completeCommand.ServiceFee = this.serviceTask.ServiceFee;
            completeCommand.ServiceTaskNote = this.serviceTask.ServiceTaskNote;
            completeCommand.TicketNumber = this.serviceTask.TicketNumber;
            completeCommand.Group = this.serviceTask.Group;

            this.ServiceTaskCommand.doCommand(completeCommand)
                .then(() => {
                    this.getServiceTask();
                });
        }

        getEvents = (): void => {
            this.ServiceTaskEvent.getByID(this.serviceTaskID)
                .then((dataEvents) => {
                    this.currentObjectEvents = AppCommon.EventUtils.parseEventsHtml(dataEvents);
                });
        }

        toggleInfo = (index: number): void => {
            var event = this.currentObjectEvents[index];

            // toggle event content 
            if (event.display)
                $($('.formatted-object')[index]).css({ "height": "65px", "overflow-y": "hidden" });
            else
                $($('.formatted-object')[index]).css({ "height": "auto", "overflow-y": "visible" });

            event.display = !event.display;
        }
    }

    angular.module("app.staff")
        .controller("SingleServiceTaskController",
        [
            "$stateParams", "AuthService", "SessionService", "DispatcherAirportTicketQuery", "ServiceTaskQuery", "ServiceTaskCommand", "ServiceTaskEvent",
            (stateParams, auth, sess, ticket, task, command, asfevents) => new SingleServiceTaskController(stateParams, auth, sess, ticket, task, command, asfevents)
        ]);
}