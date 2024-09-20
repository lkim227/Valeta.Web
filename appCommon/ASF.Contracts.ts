///<reference path='mscorlib.ts'/>
enum ServiceTaskStatus
{
	Created,
	GoingToService,
	AtService,
	ServiceFinished,
	BackAtBase,
	Deleted = 10,
	Completed,
	Cancelled
}
class IDAndFriendlyID extends NObject
{
	ID: string = null;
	FriendlyID: string = null;
	Equals(obj: any): boolean
	{
		var iDAndFriendlyID: IDAndFriendlyID = ((obj instanceof IDAndFriendlyID)?<IDAndFriendlyID>obj:null);
		var flag: boolean = iDAndFriendlyID === null;
		return !flag && this.ID === iDAndFriendlyID.ID;
	}
	GetHashCode(): number
	{
		return NString.GetHashCode(this.ID);
	}
	constructor()
	{
		super();
	}
}
class SelectableServiceTaskQueryParameter extends NObject
{
	DateUsedToCalculateIntake: string = null;
	DateUsedToCalculateGiveBack: string = null;
	VehicleMake: string = null;
	VehicleModel: string = null;
	constructor()
	{
		super();
	}
}
class ServiceTaskQueryResult extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	OfferedServiceID: string = null;
	ServiceName: string = null;
	Category: string = null;
	TicketNumber: number = 0;
	IsTicketClosed: boolean = false;
	ServiceTaskStatus: ServiceTaskStatus = 0;
	EmployeeID: string = null;
	EmployeeFriendlyID: string = null;
	ServiceFee: number = 0;
	ServiceTaskNote: string = null;
	ProviderCharge: number = 0;
	ExpectedIntakeDateTime: string = null;
	ExpectedGiveBackDateTime: string = null;
	OperatingLocationID: string = null;
	CustomerID: string = null;
	CustomerName: string = null;
	MobilePhone: string = null;
	EmailAddress: string = null;
	VehicleLicensePlate: string = null;
	VehicleFriendlyName: string = null;
	ReservationNote: string = null;
	SlotCode: string = null;
	KeysLocation: string = null;
	TaxRate: number = 0;
	Group: string = null;
	constructor()
	{
		super();
	}
}
class ServiceTaskSummary extends NObject
{
	TicketNumber: number = 0;
	NumberCompletedServices: number = 0;
	NumberUncompletedServices: number = 0;
	ListOfCompletedServices: string = null;
	ListOfUncompletedServices: string = null;
	constructor()
	{
		super();
	}
}
class AssignEmployeeToServiceTaskCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	EmployeeID: string = null;
	EmployeeFriendlyID: string = null;
	constructor()
	{
		super();
	}
}
class ClaimServiceTaskCustodyCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	EmployeeID: string = null;
	EmployeeFriendlyID: string = null;
	constructor()
	{
		super();
	}
}
class CompleteServiceTaskCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	ServiceName: string = null;
	ProviderCharge: number = 0;
	ServiceFee: number = 0;
	ServiceTaskNote: string = null;
	TicketNumber: number = 0;
	Group: string = null;
	constructor()
	{
		super();
	}
}
class CreateServiceTaskCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	OfferedServiceID: string = null;
	ServiceName: string = null;
	Category: string = null;
	TicketNumber: number = 0;
	ServiceFee: number = 0;
	ServiceTaskNote: string = null;
	DepartureDateTimeCustomerMeetsValet: string = null;
	ReturnDateTime: string = null;
	OperatingLocationID: string = null;
	CustomerID: string = null;
	CustomerName: string = null;
	MobilePhone: string = null;
	EmailAddress: string = null;
	VehicleLicensePlate: string = null;
	VehicleFriendlyName: string = null;
	ReservationNote: string = null;
	TaxRate: number = 0;
	SlotCode: string = null;
	KeysLocation: string = null;
	Group: string = null;
	ProviderCharge: number = 0;
	ShouldNotifyCustomer: boolean = false;
	constructor()
	{
		super();
	}
}
class DeleteServiceTaskCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	TicketNumber: number = 0;
	Group: string = null;
	constructor()
	{
		super();
	}
}
class FinishServiceTaskDropOffCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	constructor()
	{
		super();
	}
}
class RecordServiceTaskReceiptCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	ProviderCharge: number = 0;
	ServiceTaskNote: string = null;
	DateCreated: string = null;
	PhotoFileName: string = null;
	Description: string = null;
	TicketNumber: number = 0;
	Group: string = null;
	constructor()
	{
		super();
	}
}
class UpdateNoteOnServiceTaskCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	Note: string = null;
	TicketNumber: number = 0;
	Group: string = null;
	constructor()
	{
		super();
	}
}
class UpdateServiceTaskCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	OfferedServiceID: string = null;
	ServiceName: string = null;
	Category: string = null;
	ServiceTaskStatus: ServiceTaskStatus = 0;
	EmployeeID: string = null;
	EmployeeFriendlyID: string = null;
	ServiceFee: number = 0;
	ServiceTaskNote: string = null;
	ProviderCharge: number = 0;
	SlotCode: string = null;
	KeysLocation: string = null;
	TaxRate: number = 0;
	TicketNumber: number = 0;
	Group: string = null;
	constructor()
	{
		super();
	}
}
class ServiceTaskConfiguration_Routing_QueryMethods extends NObject
{
	static GetByTicketNumber: string = "GetByTicketNumber";
	static GetByTicketNumberByStatus: string = "GetByTicketNumberByStatus";
	static GetFulfillmentQueue: string = "GetFulfillmentQueue";
	static GetMyNextServiceTask: string = "GetMyNextServiceTask";
	static GetEmployeesToAssignTaskTo: string = "GetEmployeesToAssignTaskTo";
	static GetSummaryForTicket: string = "GetSummaryForTicket";
	static GetAllThisMonth: string = "GetAllThisMonth";
	static GetAllLastMonth: string = "GetAllLastMonth";
	constructor()
	{
		super();
	}
}
class ServiceTaskConfiguration_Routing_CommandMethods extends NObject
{
	static UpdateServiceTaskQueryResult: string = "UpdateServiceTaskQueryResult";
	static AssignEmployeeToServiceTask: string = "AssignEmployeeToServiceTask";
	static ClaimServiceTaskCustody: string = "ClaimServiceTaskCustody";
	static CompleteServiceTask: string = "CompleteServiceTask";
	static CreateServiceTask: string = "CreateServiceTask";
	static DeleteServiceTask: string = "DeleteServiceTask";
	static DeleteServiceTasksForTicketNumber: string = "DeleteServiceTasksForTicketNumber";
	static DeleteServiceTaskFromOfferedServiceOnTicket: string = "DeleteServiceTaskFromOfferedServiceOnTicket";
	static FinishServiceTaskDropOff: string = "FinishServiceTaskDropOff";
	static RecordServiceTaskReceipt: string = "RecordServiceTaskReceipt";
	static UpdateServiceTask: string = "UpdateServiceTask";
	static UpdateNoteOnServiceTask: string = "UpdateNoteOnServiceTask";
	constructor()
	{
		super();
	}
}
class ServiceTaskConfiguration_Routing_MessagingMethods extends NObject
{
	static CreateServiceTaskFromReservation: string = "CreateServiceTaskFromReservation";
	static SlotUpdatedFromTicket: string = "SlotUpdatedFromTicket";
	static KeysLocationUpdatedFromTicket: string = "KeysLocationUpdatedFromTicket";
	static TicketCancelledFromTicket: string = "TicketCancelledFromTicket";
	static TicketClosedFromTicket: string = "TicketClosedFromTicket";
	static TicketGiveBackDateIsChangedFromTicket: string = "TicketGiveBackDateIsChangedFromTicket";
	static TicketIntakeDateIsChangedFromTicket: string = "TicketIntakeDateIsChangedFromTicket";
	static BillingMakeReadyFromTicket: string = "BillingMakeReadyFromTicket";
	constructor()
	{
		super();
	}
}
class ServiceTaskConfiguration_Routing_CommonMethods extends NObject
{
	static GetByIDMethod: string = "GetByID";
	constructor()
	{
		super();
	}
}
class ServiceTaskConfiguration_Routing extends NObject
{
	static SelectableServiceTasksRoute: string = "SelectableServiceTasks";
	static EventsRoute: string = "ServiceTaskEvents";
	static QueryRoute: string = "ServiceTaskQueries";
	static CommandRoute: string = "ServiceTaskCommands";
	static SummaryRoute: string = "ServiceTaskSummary";
	static MessagingRoute: string = "ProcessMessages";
	constructor()
	{
		super();
	}
}
