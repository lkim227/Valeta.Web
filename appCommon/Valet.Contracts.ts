///<reference path='mscorlib.ts'/>
enum GreeterSagaStatus
{
	Created,
	Assigned,
	AvailableToClaim = 4,
	InCustody,
	Released = 10,
	Completed
}
enum RunnerSagaStatus
{
	Created,
	Assigned,
	AcknowledgedAssignment,
	AvailableToClaim = 4,
	InCustody,
	GoingToBase,
	RequestedBack,
	GoingToGreeter,
	ArrivedToBase,
	ParkedAtBase,
	KeysAreHung,
	Completed = 20
}
enum ShiftStatus
{
	StartRequested,
	InShift,
	EndRequested,
	Ended
}
class DispatchParameters extends NObject
{
	OperatingLocationID: string = null;
	ZoneID: string = null;
	FromDateTime: string = null;
	ToDateTime: string = null;
	GreeterID: string = null;
	constructor()
	{
		super();
	}
}
class GreeterAssignmentQueryResult extends NObject
{
	ID: string = null;
	AssignedRole: Role = 0;
	AssignedZones: AssignedZoneDTO[] = null;
	constructor()
	{
		super();
	}
}
class MoveGreeterFromZoneToZoneDTO extends NObject
{
	RemoveCommand: RemoveGreeterFromZoneCommandDTO = null;
	PlaceCommand: PlaceValetIntoZoneCommandDTO = null;
	constructor()
	{
		super();
	}
}
class ValetQueryResult extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	Name: NameDTO = null;
	FriendlyID: string = null;
	OperatingLocationID: string = null;
	PreferredRole: Role = 0;
	DeviceCode: string = null;
	PushNotificationRegistrationToken: string = null;
	ShiftStatus: ShiftStatus = 0;
	GeoLocation: GeoLocation = null;
	AssignedZones: AssignedZoneDTO[] = null;
	AssignedRole: Role = 0;
	LastZoneIDRunnerWasIn: string = null;
	constructor()
	{
		super();
	}
}
class RunnerQueryResult extends ValetQueryResult
{
	CurrentTicketNumber: string = null;
	CurrentRunnerSagaStatus: string = null;
	constructor()
	{
		super();
	}
}
class SagaValetEventsParameters extends NObject
{
	FromDateTime: string = null;
	ToDateTime: string = null;
	EmployeeID: string = null;
	constructor()
	{
		super();
	}
}
class ValetLogInDTO extends NObject
{
	GeoLocation: GeoLocation = null;
	OperatingLocationID: string = null;
	Pin: string = null;
	PreferredRole: string = null;
	DeviceCode: string = null;
	PushNotificationRegistrationToken: string = null;
	constructor()
	{
		super();
	}
}
class AssignedZoneDTO extends NObject
{
	ZoneID: string = null;
	ZoneCode: string = null;
	CheckedInDateTime: string = null;
	IsAssignedZoneAccepted: boolean = false;
	constructor()
	{
		super();
	}
}
class TicketQueryResult extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	Created: string = null;
	CreatedBy: string = null;
	IntakeDateTime: DateTime = null;
	GiveBackDateTime: DateTime = null;
	TicketNumber: number = 0;
	TicketStatus: TicketStatus = 0;
	NeedsManagerAttention: boolean = false;
	ReasonForManagerAttention: string = null;
	OperatingLocationID: string = null;
	OperatingLocationNumberOfHoursCustomerCanCancelReservation: number = 0;
	Customer: UserDTO = null;
	Vehicle: VehicleDTO = null;
	NoteToCustomer: string = null;
	ReservationNote: string = null;
	OfficeNote: string = null;
	DispatcherWorkingNote: string = null;
	IntakeGeneralWarningMessage: string = null;
	IntakeZoneID: string = null;
	IntakeZoneCode: string = null;
	IntakeZoneSource: string = null;
	IntakeZoneWarningMessage: string = null;
	IntakeSmsSent: string = null;
	GiveBackGeneralWarningMessage: string = null;
	GiveBackZoneID: string = null;
	GiveBackZoneCode: string = null;
	GiveBackZoneSource: string = null;
	GiveBackZoneWarningMessage: string = null;
	GiveBackSmsSent: string = null;
	LotID: string = null;
	LotName: string = null;
	SlotCode: string = null;
	KeyTag: string = null;
	KeysLocation: string = null;
	TravelDirection: TravelDirection = 0;
	ProcessPaymentBeforeComplete: boolean = false;
	PaymentStatus: PaymentStatus = 0;
	StageLocation: string = null;
	CCEmails: string = null;
	GeoLocation: GeoLocation = null;
	GreeterSagaID: string = null;
	GreeterSagaEmployeeID: string = null;
	GreeterSagaEmployeeFriendlyID: string = null;
	GreeterSagaStatus: GreeterSagaStatus = 0;
	ShowAssignGreeter: boolean = false;
	RunnerSagaID: string = null;
	RunnerSagaEmployeeID: string = null;
	RunnerSagaEmployeeFriendlyID: string = null;
	RunnerSagaStatus: RunnerSagaStatus = 0;
	ShowAssignRunner: boolean = false;
	DateCaptured: string = null;
	CapturedDateTime: DateTime = null;
	MessagesSent: MessageSentDTO[] = null;
	constructor()
	{
		super();
	}
}
class AirportTicketQueryResult extends TicketQueryResult
{
	ActiveAirportMeet: ActiveAirportMeetDTO = null;
	NumberOfPeopleReturning: number = 0;
	VehicleChecklistFields: VehicleChecklistFieldsQueryResult = null;
	constructor()
	{
		super();
	}
}
class ClaimCheckDTO extends NObject
{
	ID: string = null;
	TicketNumber: number = 0;
	TicketStatus: TicketStatus = 0;
	OperatingLocationID: string = null;
	OperatingLocationName: string = null;
	OperatingLocationClaimCheckLegalDisclaimer: string = null;
	VehicleFriendlyName: string = null;
	TravelDirection: TravelDirection = 0;
	ProcessPaymentBeforeComplete: boolean = false;
	PaymentStatus: PaymentStatus = 0;
	GeoLocation: GeoLocation = null;
	GiveBackDateTimeCustomerMeetsValet: string = null;
	GiveBackZoneCode: string = null;
	constructor()
	{
		super();
	}
}
class CurrentStateAirportTicketQueryResult extends NObject
{
	ID: string = null;
	GreeterSagaID: string = null;
	GreeterSagaEmployeeID: string = null;
	GreeterSagaEmployeeFriendlyID: string = null;
	GreeterSagaStatus: GreeterSagaStatus = 0;
	ShowAssignGreeter: boolean = false;
	RunnerSagaID: string = null;
	RunnerSagaEmployeeID: string = null;
	RunnerSagaEmployeeFriendlyID: string = null;
	RunnerSagaStatus: RunnerSagaStatus = 0;
	ShowAssignRunner: boolean = false;
	TicketNumber: number = 0;
	OperatingLocationID: string = null;
	TicketStatus: TicketStatus = 0;
	NeedsManagerAttention: boolean = false;
	ReasonForManagerAttention: string = null;
	CustomerID: string = null;
	CustomerName: string = null;
	MobilePhone: string = null;
	EmailAddress: string = null;
	Vehicle: VehicleDTO = null;
	NoteToCustomer: string = null;
	ReservationNote: string = null;
	OfficeNote: string = null;
	DispatcherWorkingNote: string = null;
	StageLocation: string = null;
	FlightSpecifications: FlightSpecificationsDTO = null;
	RelativeMeetLocation: string = null;
	MeetTimeOffsetInMinutes: number = 0;
	Schedule: ScheduleDTO = null;
	FlightStatus: FlightStatusDTO = null;
	DateTimeCustomerMeetsValet: string = null;
	MeetTimeWarningMessage: string = null;
	DateTimeCustomerMeetsValetGrouping: string = null;
	GiveBackIsCheckingBags: boolean = false;
	UseTollTag: boolean = false;
	NumberOfPeopleReturning: number = 0;
	GeneralWarningMessage: string = null;
	ZoneWarningMessage: string = null;
	ZoneID: string = null;
	ZoneCode: string = null;
	SortZoneCode: string = null;
	LotID: string = null;
	LotName: string = null;
	SlotCode: string = null;
	KeyTag: string = null;
	KeysLocation: string = null;
	TravelDirection: TravelDirection = 0;
	CCEmails: string = null;
	PaymentStatus: PaymentStatus = 0;
	ProcessPaymentBeforeComplete: boolean = false;
	SmsSentMessage: string = null;
	constructor()
	{
		super();
	}
}
class CustomerTicketDTO extends NObject
{
	ID: string = null;
	CustomerID: string = null;
	TicketNumber: number = 0;
	TicketStatus: TicketStatus = 0;
	NumberOfPeopleReturning: number = 0;
	Customer: UserDTO = null;
	ReservationNote: string = null;
	NoteToCustomer: string = null;
	CCEmails: string = null;
	OperatingLocationID: string = null;
	Vehicle: VehicleDTO = null;
	ActiveAirportMeet: ActiveAirportMeetDTO = null;
	CatchAllPaymentMethodID: string = null;
	CatchAllPaymentMethodFriendlyName: string = null;
	AllowancePaymentMethodID: string = null;
	AllowancePaymentMethodFriendlyName: string = null;
	RewardNames: string = null;
	PromotionCodes: string = null;
	CanEdit: boolean = false;
	CanCancel: boolean = false;
	NeedToCallToCancel: boolean = false;
	IsReservationWithoutTicket: boolean = false;
	HasReceipt: boolean = false;
	BillingDocumentName: string = null;
	constructor()
	{
		super();
	}
}
class ReservationAndTicketHistory extends NObject
{
	ID: string = null;
	TicketNumber: number = 0;
	TicketStatus: TicketStatus = 0;
	CustomerID: string = null;
	Vehicle: VehicleDTO = null;
	IntakeSpecifications: FlightSpecificationsDTO = null;
	IntakeSchedule: ScheduleDTO = null;
	IntakeOffsetFromScheduledDateTimeInMinutes: number = 0;
	GiveBackSpecifications: FlightSpecificationsDTO = null;
	GiveBackSchedule: ScheduleDTO = null;
	GiveBackIsCheckingBags: boolean = false;
	StatusDisplay: string = null;
	CanEdit: boolean = false;
	CanCancel: boolean = false;
	NeedToCallToCancel: boolean = false;
	IsReservationWithoutTicket: boolean = false;
	HasReceipt: boolean = false;
	BillingDocumentName: string = null;
	ReceiptHTMLURL: string = null;
	IntakeDate: string = null;
	GiveBackDate: string = null;
	constructor()
	{
		super();
	}
}
class RunnerAirportTicketQueryResult extends AirportTicketQueryResult
{
	IntakeGoToZoneInstruction: string = null;
	GiveBackGoToZoneInstruction: string = null;
	constructor()
	{
		super();
	}
}
class ActiveAirportMeetDTO extends NObject
{
	IntakeSpecifications: FlightSpecificationsDTO = null;
	IntakeRelativeMeetLocation: string = null;
	IntakeOffsetFromScheduledDateTimeInMinutes: number = 0;
	IntakeSchedule: ScheduleDTO = null;
	IntakeStatus: FlightStatusDTO = null;
	IntakeDateTimeCustomerMeetsValet: string = null;
	IntakeMeetTimeWarningMessage: string = null;
	GiveBackSpecifications: FlightSpecificationsDTO = null;
	GiveBackRelativeMeetLocation: string = null;
	GiveBackIsCheckingBags: boolean = false;
	GiveBackSchedule: ScheduleDTO = null;
	GiveBackStatus: FlightStatusDTO = null;
	GiveBackDateTimeCustomerMeetsValet: string = null;
	GiveBackMeetTimeWarningMessage: string = null;
	constructor()
	{
		super();
	}
}
class MessageSentDTO extends NObject
{
	MessageName: string = null;
	SentOn: DateTime = null;
	constructor()
	{
		super();
	}
}
class UserDTO extends NObject
{
	AccountID: string = null;
	Name: NameDTO = null;
	MobilePhone: PhoneNumberDTO = null;
	Email: EmailDTO = null;
	constructor()
	{
		super();
	}
}
class DepartureChecklistQueryResult extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	TicketNumber: number = 0;
	KeyTag: string = null;
	DepartureChecklistRequiredFields: DepartureChecklistRequiredFieldsQueryResult = null;
	VehicleChecklistFields: VehicleChecklistFieldsQueryResult = null;
	ReservationNote: string = null;
	OfficeNote: string = null;
	IsComplete: boolean = false;
	constructor()
	{
		super();
	}
}
class DepartureChecklistRequiredFieldsQueryResult extends NObject
{
	UseTollTag: boolean = false;
	NumberOfPeopleReturning: number = 0;
	GiveBackIsCheckingBags: boolean = false;
	ReturnAirlineCode: string = null;
	ReturnFlightNumber: string = null;
	ReturnDateUsedToCalculateMeetTime: string = null;
	ReturnScheduleTime: string = null;
	GotKeys: boolean = false;
	constructor()
	{
		super();
	}
}
class VehicleChecklistFieldsQueryResult extends NObject
{
	Mileage: Nullable<number> = null;
	FuelLevelPercent: Nullable<number> = null;
	StageLocation: string = null;
	RadioStation: string = null;
	constructor()
	{
		super();
	}
}
class DenyEndShiftCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class DenyStartShiftCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class EndShiftCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class MakeARunnerCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class MakeRunnerAvailableCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class PlaceValetIntoZoneCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Zone: ZoneDTO = null;
	constructor()
	{
		super();
	}
}
class RemoveGreeterFromZoneCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	ZoneIDRemovedFrom: string = null;
	constructor()
	{
		super();
	}
}
class RequestEndShiftCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class StartShiftCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class AcknowledgeRunnerAssignmentCommandDTO extends NObject
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
class AssignRunnerCommandDTO extends NObject
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
class HangKeysCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	KeysLocation: string = null;
	constructor()
	{
		super();
	}
}
class RunnerAnnounceVehicleAtBaseCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	constructor()
	{
		super();
	}
}
class RunnerClaimCustodyCommandDTO extends NObject
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
class RunnerParkVehicleCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	LotID: string = null;
	LotName: string = null;
	SlotCode: string = null;
	constructor()
	{
		super();
	}
}
class RunnerReleaseCustodyCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	LastZoneID: string = null;
	constructor()
	{
		super();
	}
}
class TakeVehicleToBaseCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	constructor()
	{
		super();
	}
}
class TakeVehicleToGreeterCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	constructor()
	{
		super();
	}
}
class UnassignRunnerCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	RemovedEmployeeID: string = null;
	constructor()
	{
		super();
	}
}
class AcknowledgeGreeterAssignmentCommandDTO extends NObject
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
class AssignSpecificGreeterCommandDTO extends NObject
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
class CheckIntoZoneCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	constructor()
	{
		super();
	}
}
class CompleteGreeterSagaCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	OfficeNote: string = null;
	HasProblems: boolean = false;
	HasUncompletedServiceTasks: boolean = false;
	constructor()
	{
		super();
	}
}
class GreeterClaimCustodyCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	EmployeeID: string = null;
	EmployeeFriendlyID: string = null;
	TravelDirection: TravelDirection = 0;
	constructor()
	{
		super();
	}
}
class GreeterReleaseCustodyCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	RunnerSagaStatus: RunnerSagaStatus = 0;
	constructor()
	{
		super();
	}
}
class TransferGreeterCustodyCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	ToEmployeeID: string = null;
	ToEmployeeFriendlyID: string = null;
	constructor()
	{
		super();
	}
}
class UnassignSpecificGreeterCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class CancelTicketCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class ChangeNumberOfPeopleReturningCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	NumberOfPeopleReturning: number = 0;
	constructor()
	{
		super();
	}
}
class ChangeEmailAddressCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	EmailAddress: string = null;
	constructor()
	{
		super();
	}
}
class ChangeGiveBackFlightSpecificationsCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	FlightSpecifications: FlightSpecificationsDTO = null;
	constructor()
	{
		super();
	}
}
class ChangeGiveBackFlightStatusCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	FlightStatus: FlightStatusDTO = null;
	constructor()
	{
		super();
	}
}
class ChangeGiveBackIsCheckingBagsCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GiveBackIsCheckingBags: boolean = false;
	constructor()
	{
		super();
	}
}
class ChangeGiveBackScheduleCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Schedule: ScheduleDTO = null;
	constructor()
	{
		super();
	}
}
class ChangeGiveBackSpecificationsAndScheduleAndFlightStatusCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	FlightSpecifications: FlightSpecificationsDTO = null;
	Schedule: ScheduleDTO = null;
	FlightStatus: FlightStatusDTO = null;
	constructor()
	{
		super();
	}
}
class ChangeGiveBackZoneCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	ZoneID: string = null;
	ZoneCode: string = null;
	constructor()
	{
		super();
	}
}
class ChangeGiveBackZoneWarningMessageCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	WarningMessage: string = null;
	constructor()
	{
		super();
	}
}
class ChangeIntakeFlightSpecificationsCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	FlightSpecifications: FlightSpecificationsDTO = null;
	constructor()
	{
		super();
	}
}
class ChangeIntakeFlightStatusCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	FlightStatus: FlightStatusDTO = null;
	constructor()
	{
		super();
	}
}
class ChangeIntakeRelativeMeetLocationCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	IntakeRelativeMeetLocation: string = null;
	constructor()
	{
		super();
	}
}
class ChangeIntakeOffsetCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	OffsetMinutes: number = 0;
	constructor()
	{
		super();
	}
}
class ChangeIntakeScheduleCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Schedule: ScheduleDTO = null;
	constructor()
	{
		super();
	}
}
class ChangeIntakeSpecificationsAndScheduleAndFlightStatusCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	FlightSpecifications: FlightSpecificationsDTO = null;
	Schedule: ScheduleDTO = null;
	FlightStatus: FlightStatusDTO = null;
	constructor()
	{
		super();
	}
}
class ChangeIntakeZoneCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	ZoneID: string = null;
	ZoneCode: string = null;
	constructor()
	{
		super();
	}
}
class ChangeIntakeZoneWarningMessageCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	WarningMessage: string = null;
	constructor()
	{
		super();
	}
}
class ChangeKeyTagCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	KeyTag: string = null;
	constructor()
	{
		super();
	}
}
class ChangeMobilePhoneCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	MobilePhone: string = null;
	Note: string = null;
	constructor()
	{
		super();
	}
}
class ChangeNoteToCustomerCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	NoteToCustomer: string = null;
	AppendToExistingNote: boolean = false;
	constructor()
	{
		super();
	}
}
class ChangeCCEmailsCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	CCEmails: string = null;
	constructor()
	{
		super();
	}
}
class ChangeOfficeNoteCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	OfficeNote: string = null;
	constructor()
	{
		super();
	}
}
class ChangeReservationNoteCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	ReservationNote: string = null;
	constructor()
	{
		super();
	}
}
class ChangeTicketStatusCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	NewStatus: TicketStatus = 0;
	constructor()
	{
		super();
	}
}
class ChangeUseTollTagCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	UseTollTag: boolean = false;
	constructor()
	{
		super();
	}
}
class ChangeVehicleCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Vehicle: VehicleDTO = null;
	constructor()
	{
		super();
	}
}
class CloseAirportTicketCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	OfficeNote: string = null;
	constructor()
	{
		super();
	}
}
class CloseAirportTicketWithUncompletedServicesCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	UncompleteServiceTaskExplanation: string = null;
	constructor()
	{
		super();
	}
}
class CreateAirportTicketCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	TicketNumber: number = 0;
	OperatingLocationID: string = null;
	OperatingLocationNumberOfHoursCustomerCanCancelReservation: number = 0;
	CustomerID: string = null;
	CustomerName: NameDTO = null;
	MobilePhone: PhoneNumberDTO = null;
	Email: EmailDTO = null;
	ReservationNote: string = null;
	Vehicle: VehicleDTO = null;
	ActiveAirportMeet: ActiveAirportMeetDTO = null;
	CCEmails: string = null;
	PaymentStatus: PaymentStatus = 0;
	constructor()
	{
		super();
	}
}
class CreateDriveUpNewCustomerTicketCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	EmployeeID: string = null;
	EmployeeFriendlyID: string = null;
	OperatingLocationID: string = null;
	CustomerID: string = null;
	CustomerName: NameDTO = null;
	MobilePhone: PhoneNumberDTO = null;
	ReservationNote: string = null;
	KeyTag: string = null;
	Vehicle: VehicleDTO = null;
	ReturnFlightSpecifications: FlightSpecificationsDTO = null;
	ReturnFlightSchedule: ScheduleDTO = null;
	PaymentStatus: PaymentStatus = 0;
	ZoneID: string = null;
	ZoneCode: string = null;
	constructor()
	{
		super();
	}
}
class CreateDriveUpExistingCustomerTicketCommandDTO extends CreateDriveUpNewCustomerTicketCommandDTO
{
	Email: EmailDTO = null;
	constructor()
	{
		super();
	}
}
class CustomerChangeAirportTicketAndBilling extends NObject
{
	CustomerChangeAirportTicketCommand: CustomerChangeAirportTicketCommandDTO = null;
	ReservationCatchAllOrder: ReservationCatchAllOrderDTO = null;
	ReservedPromotionDiscounts: ReservedPromotionDiscountDTO[] = null;
	CartOfRewards: ReservedRewardDTO[] = null;
	ReservationAllowanceOrder: ReservationAllowanceOrderDTO = null;
	constructor()
	{
		super();
	}
}
class CustomerChangeAirportTicketCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	TicketNumber: number = 0;
	MobilePhone: PhoneNumberDTO = null;
	Email: EmailDTO = null;
	ReservationNote: string = null;
	Vehicle: VehicleDTO = null;
	ActiveAirportMeet: ActiveAirportMeetDTO = null;
	CCEmails: string = null;
	constructor()
	{
		super();
	}
}
class CustomerRequestVehicleCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	ZoneID: string = null;
	ZoneCode: string = null;
	constructor()
	{
		super();
	}
}
class DispatchRequestVehicleCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class MarkNoShowCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class RecordMessageSentCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	MessageSent: MessageSentDTO = null;
	constructor()
	{
		super();
	}
}
class RemoveManagerAttentionCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class RequestManagerAttentionCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Reason: string = null;
	constructor()
	{
		super();
	}
}
class SetActualSlotAndKeysLocationAtBaseCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	SetActualSlotCommand: SetActualSlotCommandDTO = null;
	KeysLocation: string = null;
	constructor()
	{
		super();
	}
}
class SetActualSlotCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	TicketNumber: number = 0;
	LotID: string = null;
	LotName: string = null;
	SlotCode: string = null;
	constructor()
	{
		super();
	}
}
class SetKeysLocationAtBaseCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	KeysLocation: string = null;
	constructor()
	{
		super();
	}
}
class SetStageLocationCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	StageLocation: string = null;
	constructor()
	{
		super();
	}
}
class StartDispatchCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class SubmitDepartureChecklistCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	KeyTag: string = null;
	UseTollTag: boolean = false;
	NumberOfPeopleReturning: number = 0;
	GiveBackIsCheckingBags: boolean = false;
	ReturnAirlineCode: string = null;
	ReturnFlightNumber: string = null;
	ReturnDateUsedToCalculateMeetTime: string = null;
	ReturnScheduleTime: string = null;
	ChecklistOptionalFields: VehicleChecklistFieldsQueryResult = null;
	ReservationNote: string = null;
	OfficeNote: string = null;
	IsComplete: boolean = false;
	constructor()
	{
		super();
	}
}
class SubmitReturnChecklistCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	GeoLocation: GeoLocation = null;
	ChecklistOptionalFields: VehicleChecklistFieldsQueryResult = null;
	ReservationNote: string = null;
	OfficeNote: string = null;
	constructor()
	{
		super();
	}
}
class ChangeAirportTicketBasicDataCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	NumberOfPeopleReturning: number = 0;
	Customer: UserDTO = null;
	ReservationNote: string = null;
	CCEmails: string = null;
	constructor()
	{
		super();
	}
}
class ChangeAirportTicketFlightsCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	IntakeSpecifications: FlightSpecificationsDTO = null;
	IntakeRelativeMeetLocation: string = null;
	IntakeOffsetFromScheduledDateTimeInMinutes: number = 0;
	GiveBackSpecifications: FlightSpecificationsDTO = null;
	GiveBackIsCheckingBags: boolean = false;
	constructor()
	{
		super();
	}
}
class ValetConfiguration_Routing_AirportTicketFixDataMethods extends NObject
{
	static ChangeTicketStatus: string = "ChangeTicketStatus";
	constructor()
	{
		super();
	}
}
class ValetConfiguration_Routing_PushNotificationMethods extends NObject
{
	static NotifyAdhocMessage: string = "NotifyAdhocMessage";
	constructor()
	{
		super();
	}
}
class ValetConfiguration_Routing_ValetMethods extends NObject
{
	static GetMyRole: string = "GetMyRole";
	static GetMyStatus: string = "GetMyStatus";
	static GetMyPrimaryZone: string = "GetMyPrimaryZone";
	static GetValetsRequestingShiftStartByOperatingLocationID: string = "GetValetsRequestingShiftStartByOperatingLocationID";
	static GetValetsRequestingShiftEndByOperatingLocationID: string = "GetValetsRequestingShiftEndByOperatingLocationID";
	static GetValetsOnShiftByOperatingLocationID: string = "GetValetsOnShiftByOperatingLocationID";
	static GetAvailableByOperatingLocationID: string = "GetAvailableByOperatingLocationID";
	static GetGreetersByOperatingLocationID: string = "GetGreetersByOperatingLocationID";
	static GetRunnersByOperatingLocationID: string = "GetRunnersByOperatingLocationID";
	static GetGreetersByZone: string = "GetGreetersByZone";
	constructor()
	{
		super();
	}
}
class ValetConfiguration_Routing_ValetCommandMethods extends NObject
{
	static RemoveGreeterFromMultipleZones: string = "RemoveGreeterFromMultipleZones";
	static MoveGreeterFromZoneToZone: string = "MoveGreeterFromZoneToZone";
	constructor()
	{
		super();
	}
}
class ValetConfiguration_Routing_DispatcherAirportTicketMethods extends NObject
{
	static IDExists: string = "IDExists";
	static GetByTicketNumber: string = "GetByTicketNumber";
	static GetByKeyTag: string = "GetByKeyTag";
	static GetByVehicleID: string = "GetByVehicleID";
	static GetGreetersForTicket: string = "GetGreetersForTicket";
	static GetAllIntakeAndGiveBackByOperatingLocationAndDateTimeFilter: string = "GetAllIntakeAndGiveBackByOperatingLocationAndDateTimeFilter";
	static GetDepartureQueueByZone: string = "GetDepartureQueueByZone";
	static GetDepartureQueueWithNullZone: string = "GetDepartureQueueWithNullZone";
	static GetReturnQueueByZone: string = "GetReturnQueueByZone";
	static GetReturnQueueWithNullZone: string = "GetReturnQueueWithNullZone";
	static GetCapturedQueueByZone: string = "GetCapturedQueueByZone";
	static GetCapturedQueueWithNullZone: string = "GetCapturedQueueWithNullZone";
	static GetKeysAndSlotsByOperatingLocation: string = "GetKeysAndSlotsByOperatingLocation";
	constructor()
	{
		super();
	}
}
class ValetConfiguration_Routing_AirportTicketCommandMethods extends NObject
{
	static ChangeIntakeFlightStatus: string = "ChangeIntakeFlightStatus";
	static ChangeGiveBackFlightStatus: string = "ChangeGiveBackFlightStatus";
	static StartDispatch: string = "StartDispatch";
	static CustomerRequestVehicle: string = "CustomerRequestVehicle";
	static DispatchRequestVehicle: string = "DispatchRequestVehicle";
	static SetKeysLocationAtBase: string = "SetKeysLocationAtBase";
	static SetActualSlot: string = "SetActualSlot";
	static SetActualSlotAndKeysLocationAtBase: string = "SetActualSlotAndKeysLocationAtBase";
	constructor()
	{
		super();
	}
}
class ValetConfiguration_Routing_AirportTicketCustomerChangesCommandMethods extends NObject
{
	static ChangeAirportTicketBasicData: string = "ChangeAirportTicketBasicData";
	static ChangeAirportTicketFlights: string = "ChangeAirportTicketFlights";
	constructor()
	{
		super();
	}
}
class ValetConfiguration_Routing_MyTicketsMethods extends NObject
{
	static HasGreeterTickets: string = "HasGreeterTickets";
	static GetMyGreeterAssignment: string = "GetMyGreeterAssignment";
	static GetMyDepartureQueue: string = "GetMyDepartureQueue";
	static GetMyCapturedQueue: string = "GetMyCapturedQueue";
	static GetMyReturnQueue: string = "GetMyReturnQueue";
	static GetMyNextRunnerTicket: string = "GetMyNextRunnerTicket";
	constructor()
	{
		super();
	}
}
class ValetConfiguration_Routing_RunnerSagaCommandMethods extends NObject
{
	static AssignRunner: string = "AssignRunner";
	constructor()
	{
		super();
	}
}
class ValetConfiguration_Routing extends NObject
{
	static AirportTicketQueryRoute: string = "AirportTicketQuery";
	static NotifyCustomerOfGiveBackZoneRoute: string = "NotifyCustomerOfGiveBackZone";
	static NotifyCustomerOfIntakeZoneRoute: string = "NotifyCustomerOfIntakeZone";
	static AvailableClaimCheckRoute: string = "AvailableClaimCheckRoute";
	static CustomerReservationAndTicketHistoryRoute: string = "CustomerReservationAndTicketHistory";
	static CustomerTicketRoute: string = "CustomerTicketRoute";
	static AirportTicketFixDataRoute: string = "AirportTicketFixData";
	static PushNotificationRoute: string = "PushNotification";
	static ValetRoute: string = "Valet";
	static ValetCommandRoute: string = "ValetCommand";
	static RunnerAirportTicketRoute: string = "RunnerAirportTicket";
	static DispatcherAirportTicketRoute: string = "DispatcherAirportTicket";
	static AirportTicketCommandRoute: string = "AirportTicketCommand";
	static AirportTicketCustomerChangesCommandRoute: string = "AirportTicketCustomerChangesCommand";
	static MyTicketsRoute: string = "MyTickets";
	static GreeterSagaCommandRoute: string = "GreeterSagaCommand";
	static RunnerSagaCommandRoute: string = "RunnerSagaCommand";
	constructor()
	{
		super();
	}
}
