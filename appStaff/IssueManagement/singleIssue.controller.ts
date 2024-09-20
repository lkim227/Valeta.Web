module AppStaff {

    export class SingleIssueController extends AppCommon.ControllerBase {
        issueID: string;
        issue: IssueQueryResult;
        utils: AppCommon.GenericUtils;
        enumUtils: AppCommon.EnumUtils;
        formMessages: AppCommon.FormMessages;
        currentCommunicationContext: string;
        currentObjectEvents: Array<any>;
        newNote: string;
        operatingLocation: OperatingLocationDTO;

        isInEditMode: boolean;
        selectedStatus: any;
        selectedCategory: any;
        selectedEmployee: any;
        statusList: kendo.data.DataSource;
        employeeList: kendo.data.DataSource;
        issueCategoryList: kendo.data.DataSource;


        static $inject = ["$stateParams", "AuthService", "SessionService", "IssueQuery", "IssueManagementEvent", "IssueManagementCommand"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private authService: AppCommon.AuthService,
            private sessionService: AppCommon.SessionService,
            private issueRepository: AppCommon.IssueQuery,
            private issueManagementEvent: IssueManagementEvent,
            private issueManagementCommand: IssueManagementCommand) {

            super(authService);

            this.issueID = this.$stateParams["issueID"];
            this.issue = null;
            this.utils = AppCommon.GenericUtils;
            this.enumUtils = AppCommon.EnumUtils;
            this.formMessages = AppCommon.FormMessages;
            this.currentCommunicationContext = AppCommon.CommunicationUtils.referenceContextIssue;

            this.getIssue();
        }

        getIssue = (): void => {
            this.issueRepository.getByID(this.issueID)
                .then(data => {
                    if (!!data) {
                        this.issue = data;
                        this.getEvents();
                    }
                });
        }
        getEvents = (): void => {
            this.issueManagementEvent.getByID(this.issueID)
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

        addNewNote = (): void => {
            if (!!this.newNote && this.newNote.length > 0) {
                var command = IssueManagementSupport.buildAddIssueNoteCommand(this.issueID, this.newNote, this.sessionService.userInfo.employeeFriendlyID);
                this.issueManagementCommand.doCommand(command)
                    .then(() => {
                        this.getIssue();
                        this.cancelNewNote();
                    });
            }
        };
        cancelNewNote = (): void => {
            this.newNote = null;
            $("#addNewNoteWindow").data("kendoWindow").close();
        };

        recordCustomerCalled = (): void => {
            var response = confirm("Are you sure you want to record 'Called Customer' for Issue '" + this.issue.Name + "'?");
            if (response === false) {
                return;
            }

            var command = new RecordCustomerCalledCommandDTO();
            command.ID = this.issue.ID;
            command.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;

            this.issueManagementCommand.doCommand(command)
                .then(() => {
                    this.getEvents();
                });
        }
        complete = (): void => {
            var response = confirm("Are you sure you want to complete '" + this.issue.Name + "'?");
            if (response === false) {
                return;
            }

            var completeCommand = new CompleteIssueCommandDTO();
            completeCommand.ID = this.issue.ID;
            completeCommand.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;

            this.issueManagementCommand.doCommand(completeCommand)
                .then(() => {
                    this.getIssue();
                    this.getEvents();
                });
        }

        onEdit = (): void => {
            this.isInEditMode = true;
            
            //get status enum as a list
            this.statusList = AppCommon.KendoFunctions.getEnumAsKendoDataSource(IssueStatus, [IssueStatus.Cancelled, IssueStatus.Completed]);
            $("#statusList").data("kendoComboBox").value(this.issue.Status.toString());

            //get categories
            this.issueCategoryList = AppCommon.KendoFunctions.getDefinedListAsKendoDataSource("IssueCategory");
            $("#issueCategoryList").data("kendoComboBox").value(this.issue.Category);

            //get employees list
            var urlEmployees = AppConfig.APIHOST + IssueManagementConfiguration_Routing.QueryRoute + "/" + IssueManagementConfiguration_Routing_QueryMethods.GetEmployeesToAssignIssueTo + this.operatingLocation.ID;
            this.employeeList = AppCommon.KendoFunctions.getEmployees(urlEmployees);
            this.selectedEmployee = null;

            if (!!this.issue.AssignedEmployeeID) {
                $("#employeeList").data("kendoComboBox").value(this.issue.AssignedEmployeeID);
            }
        }
        onUpdate = (): void => {
            this.isInEditMode = false;
            if (!!this.selectedStatus) {
                this.issue.Status = this.selectedStatus.Value;
            }
            if (!!this.selectedCategory) {
                this.issue.Category = this.selectedCategory.Value;
            }
            if (!!this.selectedEmployee) {
                this.issue.AssignedEmployeeID = this.selectedEmployee.ID;
                this.issue.AssignedEmployeeFriendlyID = this.selectedEmployee.FriendlyID;
            }
            var command = IssueManagementSupport.constructUpdateCommand(this.issue, this.sessionService.userInfo.employeeFriendlyID);
            this.issueManagementCommand.doCommand(command)
                .then(() => {
                });
        }
        onCancel = (): void => {
            this.isInEditMode = false;
        }
    }

    angular.module("app.staff")
        .controller("SingleIssueController",
        [
            "$stateParams", "AuthService", "SessionService", "IssueQuery", "IssueManagementEvent", "IssueManagementCommand",
            (stateParams, auth, sess, issue, imevents, imcommand) => new SingleIssueController(stateParams, auth, sess, issue, imevents, imcommand)
        ]);
}