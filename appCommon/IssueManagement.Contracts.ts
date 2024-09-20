///<reference path='mscorlib.ts'/>
enum IssueStatus
{
	Created,
	Processing,
	Cancelled = 10,
	Completed
}
class IssueNoteDTO extends NObject
{
	Note: string = null;
	constructor()
	{
		super();
	}
}
class IssueQueryResult extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	Name: string = null;
	Status: IssueStatus = 0;
	Description: string = null;
	Category: string = null;
	ReferenceNumber: string = null;
	AccountID: string = null;
	CustomerName: string = null;
	MobilePhone: string = null;
	EmailAddress: string = null;
	OperatingLocationID: string = null;
	AssignedEmployeeID: string = null;
	AssignedEmployeeFriendlyID: string = null;
	IssueNotes: List<IssueNoteDTO> = null;
	constructor()
	{
		super();
	}
}
class AddIssueNoteCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Action: string = null;
	Note: string = null;
	constructor()
	{
		super();
	}
}
class CancelIssueCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class CompleteIssueCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class CreateIssueCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Name: string = null;
	Description: string = null;
	Category: string = null;
	ReferenceNumber: string = null;
	AccountID: string = null;
	CustomerName: string = null;
	MobilePhone: string = null;
	EmailAddress: string = null;
	AssignedEmployeeID: string = null;
	AssignedEmployeeFriendlyID: string = null;
	OperatingLocationID: string = null;
	constructor()
	{
		super();
	}
}
class RecordCustomerCalledCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class UpdateIssueCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Name: string = null;
	Status: IssueStatus = 0;
	Description: string = null;
	Category: string = null;
	ReferenceNumber: string = null;
	CustomerName: string = null;
	MobilePhone: string = null;
	EmailAddress: string = null;
	AssignedEmployeeID: string = null;
	AssignedEmployeeFriendlyID: string = null;
	constructor()
	{
		super();
	}
}
class IssueManagementConfiguration_Routing_QueryMethods extends NObject
{
	static GetByReference: string = "GetByReference";
	static GetByAccountID: string = "GetByAccountID";
	static GetActiveQueue: string = "GetActiveQueue";
	static GetEmployeesToAssignIssueTo: string = "GetEmployeesToAssignIssueTo";
	constructor()
	{
		super();
	}
}
class IssueManagementConfiguration_Routing_CommandMethods extends NObject
{
	static AddIssueNote: string = "AddIssueNote";
	static CreateIssue: string = "CreateIssue";
	static UpdateIssue: string = "UpdateIssue";
	static UpdateIssueQueryResult: string = "UpdateIssueQueryResult";
	static CompleteIssue: string = "CompleteIssue";
	static RecordCustomerCalled: string = "RecordCustomerCalled";
	static CancelIssue: string = "CancelIssue";
	constructor()
	{
		super();
	}
}
class IssueManagementConfiguration_Routing_CommonMethods extends NObject
{
	static GetByIDMethod: string = "GetByID";
	static GetServiceUri: string = "GetServiceUri";
	constructor()
	{
		super();
	}
}
class IssueManagementConfiguration_Routing extends NObject
{
	static EventsRoute: string = "Events";
	static QueryRoute: string = "IssueManagementQueries";
	static CommandRoute: string = "IssueManagementCommands";
	constructor()
	{
		super();
	}
}
