module AppStaff {
    export class IssueManagementSupport {

        static buildAddIssueNoteCommand(currentIssueId: string, newNote: string, createdBy: string): AddIssueNoteCommandDTO {
            var command = new AddIssueNoteCommandDTO();
            command.ID = currentIssueId;
            command.CreatedBy = createdBy;
            var date = new Date();
            var options = { hour: "2-digit", minute: "2-digit" };
            command.Note = date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-us", options) + "   " + newNote;

            return command;
        }

        static constructUpdateCommand = (dataitem: any, createdBy: string): UpdateIssueCommandDTO => {
            var command = new UpdateIssueCommandDTO();
            command.ID = dataitem.ID;
            command.CreatedBy = createdBy;
            command.Name = dataitem.Name;
            command.Status = dataitem.Status;
            command.Description = dataitem.Description;
            command.Category = dataitem.Category;
            command.ReferenceNumber = dataitem.ReferenceNumber;
            command.CustomerName = dataitem.CustomerName;
            command.MobilePhone = dataitem.MobilePhone;
            command.EmailAddress = dataitem.EmailAddress;
            command.AssignedEmployeeID = dataitem.AssignedEmployeeID;
            command.AssignedEmployeeFriendlyID = dataitem.AssignedEmployeeFriendlyID;

            return command;
        };
    }
}