///<reference path='mscorlib.ts'/>
enum TimesheetStatus
{
	InProgress,
	PendingApproval,
	ApprovedAndClosed
}
class TimesheetQueryResult extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	EmployeeID: string = null;
	EmployeeFriendlyID: string = null;
	OperatingLocationID: string = null;
	StartDateTimestamp: number = 0;
	EndDateTimestamp: number = 0;
	TimesheetStatus: TimesheetStatus = 0;
	TotalHoursMinutesMessage: string = null;
	constructor()
	{
		super();
	}
}
class SummarizedTimesheetQueryResult extends TimesheetQueryResult
{
	TotalHours: number = 0;
	HoursPerDay: IList<KeyValuePair<string, number>> = null;
	constructor()
	{
		super();
	}
}
class ApproveTimesheetCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	EndDateIfNotSetAlready: string = null;
	constructor()
	{
		super();
	}
}
class CreateTimesheetCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	EmployeeID: string = null;
	EmployeeFriendlyID: string = null;
	OperatingLocationID: string = null;
	StartDate: string = null;
	EndDate: string = null;
	constructor()
	{
		super();
	}
}
class DeleteTimesheetCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class DenyTimesheetCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class MakeTimesheetPendingApprovalCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	EndDate: string = null;
	constructor()
	{
		super();
	}
}
class UpdateTimesheetCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	EmployeeID: string = null;
	EmployeeFriendlyID: string = null;
	OperatingLocationID: string = null;
	StartDate: string = null;
	EndDate: string = null;
	constructor()
	{
		super();
	}
}
