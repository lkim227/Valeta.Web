///<reference path='mscorlib.ts'/>
enum AlertLevel
{
	Green,
	Yellow,
	Red
}
enum CalculationFormulaType
{
	FirstDay,
	ProrateLastDay,
	DoNotProrate
}
enum ClientPlatform
{
	Web,
	Mobile_iOS,
	Mobile_Android
}
enum EntityState
{
	New,
	Updated,
	Deleted,
	Unchanged
}
enum FlightDirection
{
	Departure,
	Return
}
enum FlightStatusCode
{
	Scheduled,
	Active,
	Unknown,
	Redirected,
	Landed,
	Diverted,
	Cancelled,
	NotOperational,
	NotImplemented
}
enum PaymentStatus
{
	NeedPayment,
	Authorized,
	Paid
}
enum PointsAccountingStatus
{
	Pending,
	Completed
}
enum PromotionAppliesTo
{
	ParkingForSpecificDay,
	ParkingPerDay,
	AdditionalService
}
enum PromotionValidationStatus
{
	Invalid,
	Valid,
	Expired
}
enum ReservationStatus
{
	Unfinished,
	Pending,
	Reserved = 4,
	Cancelled = 10,
	Completed
}
enum RewardAppliesTo
{
	Gift,
	Parking,
	AdditionalService
}
enum Role
{
	Greeter = 1,
	Either,
	Runner
}
enum SupportedDefinedLists
{
	Color,
	State,
	Suffix,
	Prefix,
	MeetLocationIntake,
	MeetLocationIntakeOffice,
	MeetLocationGiveBack,
	MeetTime,
	Airline,
	SlotAttribute,
	IssueCategory,
	PromotionCategory,
	ServiceCategory
}
enum SystemUserType
{
	Customer,
	Office
}
enum TicketStatus
{
	Created,
	Incoming,
	Captured,
	CapturedReady,
	AtBase,
	AtService,
	Outgoing,
	CannotClose,
	PendingClose,
	PendingChargeProcessing,
	UnableToCharge,
	Closed,
	Cancelled,
	NoShow
}
enum TravelDirection
{
	FromCustomer,
	ToCustomer
}
enum UserType
{
	Customer,
	Employee
}
class ExceptionDTO extends NObject
{
	Message: string = null;
	ExceptionMessage: string = null;
	ExceptionType: string = null;
	StackTrace: string = null;
	constructor()
	{
		super();
	}
}
enum OmnisearchResultType
{
	CustomerCurrentRecord,
	TicketCurrentRecord,
	CustomerEvent,
	TicketEvent,
	ProgramArea
}
class OmnisearchQueryResult extends NObject
{
	ResultType: OmnisearchResultType = 0;
	ID: string = null;
	FriendlyID: string = null;
	Score: number = 0;
	LinkUrl: string = null;
	SummaryHTML: string = null;
	Updated: string = null;
	constructor()
	{
		super();
	}
}
class StringAndNumberDTO extends NObject
{
	Name: string = null;
	Value: number = 0;
	IsCurrency: boolean = false;
	constructor()
	{
		super();
	}
}
class DefinedListDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	ListName: string = null;
	Value: string = null;
	Description: string = null;
	IsPreferred: boolean = false;
	constructor()
	{
		super();
	}
}
class FieldsToCreateTasksFromReservedServices extends NObject
{
	TicketNumber: number = 0;
	OperatingLocationID: string = null;
	CustomerID: string = null;
	CustomerName: string = null;
	MobilePhone: string = null;
	EmailAddress: string = null;
	VehicleLicensePlate: string = null;
	VehicleFriendlyName: string = null;
	ReservationNote: string = null;
	DepartureDateTimeCustomerMeetsValet: string = null;
	ReturnDateTime: string = null;
	Services: OfferedServiceDTO[] = null;
	constructor()
	{
		super();
	}
}
class ManufactureDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	Make: string = null;
	Model: string = null;
	constructor()
	{
		super();
	}
}
class OfferedServiceDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	ServiceName: string = null;
	Description: string = null;
	ServiceFee: number = 0;
	ProviderCharge: number = 0;
	IsActive: boolean = false;
	MinDaysNeeded: number = 0;
	Category: string = null;
	MakesAvailableFor: string = null;
	TaxRate: number = 0;
	DisplayOrder: number = 0;
	constructor()
	{
		super();
	}
}
class ProfileImageReferenceDTO extends NObject
{
	UserType: UserType = 0;
	ID: string = null;
	Url: string = null;
	constructor()
	{
		super();
	}
}
class SelectableServiceWithTaskData extends OfferedServiceDTO
{
	IsAvailableToSelect: boolean = false;
	IsSelected: boolean = false;
	ServiceTaskNote: string = null;
	ServiceTaskID: string = null;
	ServiceTaskStatusForCustomer: string = null;
	constructor()
	{
		super();
	}
}
class PointsAccountingDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	AccountID: string = null;
	Points: number = 0;
	Created: string = null;
	CreatedBy: string = null;
	DateProcessed: string = null;
	ProcessedBy: string = null;
	ReservationID: string = null;
	RewardID: string = null;
	RewardQuantity: number = 0;
	OfficeNote: string = null;
	NoteToCustomer: string = null;
	Status: PointsAccountingStatus = 0;
	constructor()
	{
		super();
	}
}
class PointsAccountingDTOExtended extends PointsAccountingDTO
{
	ReservationNumber: Nullable<number> = null;
	RewardName: string = null;
	RewardAppliesTo: Nullable<RewardAppliesTo> = null;
	AccountName: string = null;
	Source: string = null;
	constructor()
	{
		super();
	}
}
class PromotionDiscountDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	PromotionID: string = null;
	Discount: PercentOrFlatAmountDTO = null;
	AppliesTo: PromotionAppliesTo = 0;
	OfferedServiceID: string = null;
	TieredRate_Name: string = null;
	WhichParkingDay: number = 0;
	constructor()
	{
		super();
	}
}
class PromotionDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	OperatingLocationID: string = null;
	Code: string = null;
	Description: string = null;
	IsActive: boolean = false;
	StartDate: string = null;
	EndDate: string = null;
	IsOneTime: boolean = false;
	PromotionCategory: string = null;
	constructor()
	{
		super();
	}
}
class RewardDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	Name: string = null;
	Description: string = null;
	Points: number = 0;
	IsActive: boolean = false;
	QuantityAvailable: number = 0;
	AppliesTo: RewardAppliesTo = 0;
	OfferedServiceID: string = null;
	OfficeNote: string = null;
	CustomerVisible: boolean = false;
	constructor()
	{
		super();
	}
}
class ReservationAndBilling extends NObject
{
	Reservation: ReservationDTO = null;
	Billing: BillingQueryResult = null;
	constructor()
	{
		super();
	}
}
class ReservationAndBillingForImportTool extends ReservationAndBilling
{
	OfficeNote: string = null;
	IsMissingPayment: boolean = false;
	constructor()
	{
		super();
	}
}
class ReservationDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	ReservationNumber: number = 0;
	Status: ReservationStatus = 0;
	AccountID: string = null;
	Vehicle: VehicleDTO = null;
	OperatingLocationID: string = null;
	DateCreated: string = null;
	CreatedBy: string = null;
	SystemUserType: SystemUserType = 0;
	OperatingLocationNumberOfHoursCustomerCanCancelReservation: number = 0;
	ReservedAirportMeet: ReservedAirportMeetDTO = null;
	Note: string = null;
	CCEmails: string = null;
	CreatedOnPlatform: ClientPlatform = 0;
	FriendlyName: string = null;
	CanEdit: boolean = false;
	CanCancel: boolean = false;
	NeedToCallToCancel: boolean = false;
	TakeCustomerToReservation: boolean = false;
	BillingDocumentName: string = null;
	IntakeDate: string = null;
	GiveBackDate: string = null;
	constructor()
	{
		super();
	}
}
class ReservedAirportMeetDTO extends NObject
{
	IntakeSpecifications: FlightSpecificationsDTO = null;
	IntakeRelativeMeetLocation: string = null;
	IntakeOffsetFromScheduledDateTimeInMinutes: number = 0;
	IntakeSchedule: ScheduleDTO = null;
	GiveBackSpecifications: FlightSpecificationsDTO = null;
	GiveBackRelativeMeetLocation: string = null;
	GiveBackIsCheckingBags: boolean = false;
	GiveBackSchedule: ScheduleDTO = null;
	constructor()
	{
		super();
	}
}
class PieChartDataDTO extends StringAndNumberDTO
{
	Color: string = null;
	constructor()
	{
		super();
	}
}
class StringAndTwoNumbersDTO extends StringAndNumberDTO
{
	Value2: number = 0;
	IsCurrency2: boolean = false;
	constructor()
	{
		super();
	}
}
class AdhocPushMessage extends NObject
{
	EmployeeID: string = null;
	MessageText: string = null;
	constructor()
	{
		super();
	}
}
enum PushMessageType
{
	DomainEvent,
	AdhocMessage
}
class OperatingLocationDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	CustomerCode: string = null;
	Name: string = null;
	FinancialConfiguration: FinancialConfigurationDTO = null;
	AppSetting: AppSettingDTO = null;
	LanguageSetting: LanguageSettingDTO = null;
	TimeIntervalSetting: TimeIntervalSettingDTO = null;
	ServiceTermsLink: string = null;
	ClaimCheckLegalDisclaimer: string = null;
	AirportCode: string = null;
	constructor()
	{
		super();
	}
}
class ZoneDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	Code: string = null;
	Description: string = null;
	OperatingLocationID: string = null;
	InstructionsIntakeNoBaggage: string = null;
	InstructionsIntakeWithBaggage: string = null;
	InstructionsGiveBackNoBaggage: string = null;
	InstructionsGiveBackWithBaggage: string = null;
	OrderedLotIDs: string[] = null;
	GridRow: number = 0;
	GridColumn: number = 0;
	Style: string = null;
	constructor()
	{
		super();
	}
}
class LotDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	Name: string = null;
	OperatingLocationID: string = null;
	Slots: SlotDTO[] = null;
	constructor()
	{
		super();
	}
}
class LotSlotSpreadsheetDTO extends NObject
{
	OperatingLocationID: string = null;
	LotID: string = null;
	LotName: string = null;
	SlotCode: string = null;
	SlotAttributes: string = null;
	constructor()
	{
		super();
	}
}
class SlotDTO extends NObject
{
	Code: string = null;
	Attributes: string = null;
	constructor()
	{
		super();
	}
}
class ZoneLotSpreadsheetDTO extends NObject
{
	OperatingLocationID: string = null;
	ZoneID: string = null;
	ZoneCode: string = null;
	LotID: string = null;
	LotName: string = null;
	LotOrder: number = 0;
	constructor()
	{
		super();
	}
}
class EntranceDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	OperatingLocationID: string = null;
	MeetLocationToZoneMappings: MeetLocationToZoneMappingDTO[] = null;
	Name: string = null;
	constructor()
	{
		super();
	}
}
class EntranceMeetLocationZoneSpreadsheetDTO extends NObject
{
	EntranceID: string = null;
	OperatingLocationID: string = null;
	ZoneID: string = null;
	EntranceName: string = null;
	MeetLocation: string = null;
	ZoneCode: string = null;
	constructor()
	{
		super();
	}
}
class GetZoneQueryParametersDTO extends NObject
{
	OperatingLocationID: string = null;
	Entrance: string = null;
	MeetLocation: string = null;
	constructor()
	{
		super();
	}
}
class MeetLocationToZoneMappingDTO extends NObject
{
	MeetLocation: string = null;
	ZoneID: string = null;
	constructor()
	{
		super();
	}
}
class AppSettingDTO extends NObject
{
	RequireCustomerName: boolean = false;
	RequireVehicle: boolean = false;
	RequireReturnToCustomerDate: boolean = false;
	RequireReturnFlight: boolean = false;
	RequireKeyTag: boolean = false;
	TakeDriveUpCustomers: boolean = false;
	GreeterCanDispatchRunners: boolean = false;
	TakeReservations: boolean = false;
	RequireDamagePicturesByGreeter: boolean = false;
	RequireDamagePicturesByRunner: boolean = false;
	constructor()
	{
		super();
	}
}
class FinancialConfigurationDTO extends NObject
{
	FeePercentage: number = 0;
	FeeName: string = null;
	TaxRatePercentage: number = 0;
	TieredRates: TieredRateDTO[] = null;
	CalculationFormulaType: CalculationFormulaType = 0;
	ProrateDayBaseInHours: number = 0;
	ChargeName: string = null;
	constructor()
	{
		super();
	}
}
class LanguageSettingDTO extends NObject
{
	IntakeName: string = null;
	GiveBackName: string = null;
	constructor()
	{
		super();
	}
}
class TieredRateDTO extends NObject
{
	HourStart: number = 0;
	Rate: number = 0;
	Name: string = null;
	Description: string = null;
	constructor()
	{
		super();
	}
}
class TimeIntervalSettingDTO extends NObject
{
	MinutesToStartDispatchOnIntake: number = 0;
	MinutesToStartDispatchOnGiveBack: number = 0;
	HoursBeforeIntakeCustomerCanCancelReservation: number = 0;
	MinutesRunnerAssignerShouldLookAhead: number = 0;
	constructor()
	{
		super();
	}
}
class CreateNewReservationCompletelyDTO extends NObject
{
	ID: string = null;
	AccountID: string = null;
	Vehicle: VehicleDTO = null;
	OperatingLocationID: string = null;
	DateCreated: string = null;
	CreatedBy: string = null;
	SystemUserType: SystemUserType = 0;
	ReservedAirportMeet: ReservedAirportMeetDTO = null;
	Note: string = null;
	CCEmails: string = null;
	CreatedOnPlatform: ClientPlatform = 0;
	RequestedPromotionCode: string = null;
	CartOfRewards: ReservedRewardDTO[] = null;
	CatchAllPaymentMethodID: string = null;
	CatchAllReservedServices: ReservedServiceDTO[] = null;
	CatchAllTipBreakdown: TipDTO[] = null;
	constructor()
	{
		super();
	}
}
class SignupNewCustomerDTO extends NObject
{
	ID: string = null;
	FirstName: string = null;
	LastName: string = null;
	MobilePhone: string = null;
	EmailAddress: string = null;
	Password: string = null;
	OnPlatform: string = null;
	LearnedAboutUsFrom: string = null;
	ReferredBy: string = null;
	constructor()
	{
		super();
	}
}
class AddRewardCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Reward: ReservedRewardDTO = null;
	constructor()
	{
		super();
	}
}
class AddTipCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Tip: PercentOrFlatAmountDTO = null;
	IsCatchAllOrder: boolean = false;
	ForGreeterID: string = null;
	ForGreeterFriendlyID: string = null;
	Description: string = null;
	constructor()
	{
		super();
	}
}
class AddTipsForBothOrdersCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	TipOnCatchAllOrder: PercentOrFlatAmountDTO = null;
	TipOnAllowanceOrder: PercentOrFlatAmountDTO = null;
	ForGreeterID: string = null;
	ForGreeterFriendlyID: string = null;
	Description: string = null;
	constructor()
	{
		super();
	}
}
class AdjustmentsForBothOrdersDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	AccountID: string = null;
	TicketNumber: number = 0;
	PaymentMethodIDCatchAll: string = null;
	AdjustmentOnCatchAllOrder: AdjustmentDTO = null;
	PaymentMethodIDAllowance: string = null;
	AdjustmentOnAllowanceOrder: AdjustmentDTO = null;
	constructor()
	{
		super();
	}
}
class AttemptToProcessChargesCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	constructor()
	{
		super();
	}
}
class ChangePaymentMethodCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	PaymentMethodID: string = null;
	PaymentMethodFriendlyName: string = null;
	IsCatchAllOrder: boolean = false;
	constructor()
	{
		super();
	}
}
class ChangeSalesTaxExemptCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	IsSalesTaxExempt: boolean = false;
	constructor()
	{
		super();
	}
}
class DeleteAdjustmentCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Adjustment: AdjustmentDTO = null;
	IsCatchAllOrder: boolean = false;
	constructor()
	{
		super();
	}
}
class DeleteTipCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Tip: TipDTO = null;
	IsCatchAllOrder: boolean = false;
	constructor()
	{
		super();
	}
}
class PrepareChargesCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	ServiceTaskIDsWereCancelled: string[] = null;
	constructor()
	{
		super();
	}
}
class ProcessRefundsDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	AccountID: string = null;
	TicketNumber: number = 0;
	PaymentMethodID: string = null;
	TransactionIDForOriginalCharge: string = null;
	IsCatchAllOrder: boolean = false;
	Refunds: RefundDTO[] = null;
	constructor()
	{
		super();
	}
}
class AddReservedServiceCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Group: string = null;
	ServiceTaskID: string = null;
	OfferedServiceID: string = null;
	ServiceName: string = null;
	ServiceFee: number = 0;
	TaxRate: number = 0;
	Category: string = null;
	ServiceTaskNote: string = null;
	ProviderCharge: number = 0;
	constructor()
	{
		super();
	}
}
class DeleteReservedServiceCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Group: string = null;
	ServiceTaskID: string = null;
	constructor()
	{
		super();
	}
}
class UpdateReservedServiceCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Group: string = null;
	ServiceTaskID: string = null;
	OfferedServiceID: string = null;
	ServiceName: string = null;
	ServiceFee: number = 0;
	TaxRate: number = 0;
	Category: string = null;
	ServiceTaskNote: string = null;
	ProviderCharge: number = 0;
	constructor()
	{
		super();
	}
}
class UpdateReservedServiceNoteCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Group: string = null;
	ServiceTaskID: string = null;
	ServiceTaskNote: string = null;
	constructor()
	{
		super();
	}
}
class UpdateReservedServiceProviderChargeCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	Group: string = null;
	ServiceTaskID: string = null;
	ServiceTaskNote: string = null;
	ProviderCharge: number = 0;
	constructor()
	{
		super();
	}
}
class AddPromotionDiscountCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	PromotionDiscounts: ReservedPromotionDiscountDTO[] = null;
	constructor()
	{
		super();
	}
}
class AdditionalServiceForFinancialCalculation extends NObject
{
	OfferedServiceID: string = null;
	ServiceName: string = null;
	ServiceFee: number = 0;
	TaxRate: number = 0;
	PaymentMethodID: string = null;
	PaymentMethodFriendlyName: string = null;
	ServiceTaskNote: string = null;
	ProviderCharge: number = 0;
	constructor()
	{
		super();
	}
}
class BillingQueryResult extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	TicketNumber: number = 0;
	AccountID: string = null;
	IsSalesTaxExempt: boolean = false;
	OperatingLocationID: string = null;
	FinancialConfiguration: FinancialConfigurationDTO = null;
	ReservationCatchAllOrder: ReservationCatchAllOrderDTO = null;
	ReservedPromotionDiscounts: ReservedPromotionDiscountDTO[] = null;
	CartOfRewards: ReservedRewardDTO[] = null;
	ReservationAllowanceOrder: ReservationAllowanceOrderDTO = null;
	constructor()
	{
		super();
	}
}
class PaymentMethodAuthorizationResponseDTO extends NObject
{
	TransactionID: string = null;
	ResponseCode: string = null;
	MessageCode: string = null;
	SuccessCode: string = null;
	SuccessDescription: string = null;
	ErrorCode: string = null;
	ErrorDescription: string = null;
	constructor()
	{
		super();
	}
}
class PaymentNicknameForBothOrders extends NObject
{
	NicknameCatchAll: string = null;
	NicknameAllowance: string = null;
	constructor()
	{
		super();
	}
}
class ReservationServiceDTO extends NObject
{
	ID: string = null;
	IsArchived: boolean = false;
	ReservationNumber: number = 0;
	ReservedServiceName: string = null;
	OperatingLocationID: string = null;
	VehicleFriendlyName: string = null;
	CustomerName: string = null;
	CustomerMobilePhone: string = null;
	ReturnDateTime: string = null;
	constructor()
	{
		super();
	}
}
class ReservedPromotionDiscountDTO extends PromotionDiscountDTO
{
	PromotionCode: string = null;
	PromotionDescription: string = null;
	constructor()
	{
		super();
	}
}
class ReservedRewardDTO extends RewardDTO
{
	QuantityReserved: number = 0;
	constructor()
	{
		super();
	}
}
class ValetTipDTO extends NObject
{
	Amount: number = 0;
	ForGreeterID: string = null;
	ForGreeterFriendlyID: string = null;
	ForGreeterName: string = null;
	Description: string = null;
	TicketNumber: number = 0;
	DateTicketWasCharged: DateTime = null;
	constructor()
	{
		super();
	}
}
class CheckPromotionCodeResultDTO extends NObject
{
	WillBeApplied: boolean = false;
	Message: string = null;
	RequestedPromotionDiscounts: ReservedPromotionDiscountDTO[] = null;
	constructor()
	{
		super();
	}
}
class AdjustmentDTO extends NObject
{
	Created: DateTime = null;
	Amount: number = 0;
	TaxRate: number = 0;
	FeeRate: number = 0;
	Description: string = null;
	ServiceTaskID: string = null;
	ServiceTaskCategory: string = null;
	IsAppliedToParking: boolean = false;
	TaxAmount: number = 0;
	FeeAmount: number = 0;
	AmountWithFeeAndTax: number = 0;
	constructor()
	{
		super();
	}
}
class RefundDTO extends AdjustmentDTO
{
	TransactionID: string = null;
	constructor()
	{
		super();
	}
}
class ReservationAllowanceOrderDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	SequenceNumber: number = 0;
	TipBreakdown: TipDTO[] = null;
	PaymentMethodID: string = null;
	PaymentMethodFriendlyName: string = null;
	IsPaymentAuthorized: boolean = false;
	PaymentTransactionId: string = null;
	IsPaymentCharged: boolean = false;
	ChargedAmount: number = 0;
	DateCharged: DateTime = null;
	FailedPaymentErrorCode: string = null;
	FailedPaymentErrorDescription: string = null;
	ParkingDayRateAllowance: number = 0;
	ParkingDaysAllowance: number = 0;
	ReservedServices: ReservedServiceDTO[] = null;
	ReservedParkingDays: ReservedParkingDayDTO[] = null;
	Adjustments: AdjustmentDTO[] = null;
	Refunds: RefundDTO[] = null;
	constructor()
	{
		super();
	}
}
class ReservationCatchAllOrderDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	SequenceNumber: number = 0;
	TipBreakdown: TipDTO[] = null;
	PaymentMethodID: string = null;
	PaymentMethodFriendlyName: string = null;
	IsPaymentAuthorized: boolean = false;
	PaymentTransactionId: string = null;
	IsPaymentCharged: boolean = false;
	ChargedAmount: number = 0;
	DateCharged: DateTime = null;
	FailedPaymentErrorCode: string = null;
	FailedPaymentErrorDescription: string = null;
	ReservedParkingDays: ReservedParkingDayDTO[] = null;
	ReservedServices: ReservedServiceDTO[] = null;
	Adjustments: AdjustmentDTO[] = null;
	Refunds: RefundDTO[] = null;
	constructor()
	{
		super();
	}
}
class ReservedParkingDayDTO extends NObject
{
	SequenceNumber: number = 0;
	Description: string = null;
	Quantity: number = 0;
	Rate: number = 0;
	Amount: number = 0;
	TieredRate_Name: string = null;
	constructor()
	{
		super();
	}
}
class ReservedServiceDTO extends NObject
{
	ServiceTaskID: string = null;
	OfferedServiceID: string = null;
	ServiceName: string = null;
	ServiceFee: number = 0;
	TaxRate: number = 0;
	Category: string = null;
	ServiceTaskNote: string = null;
	ProviderCharge: number = 0;
	IsRemoved: boolean = false;
	constructor()
	{
		super();
	}
}
class PercentOrFlatAmountDTO extends NObject
{
	IsPercentage: boolean = false;
	Amount: number = 0;
	constructor()
	{
		super();
	}
}
class TipDTO extends PercentOrFlatAmountDTO
{
	IsFromReservation: boolean = false;
	ForGreeterID: string = null;
	ForGreeterFriendlyID: string = null;
	Description: string = null;
	Updated: DateTime = null;
	UpdatedBy: string = null;
	constructor()
	{
		super();
	}
}
class BillingDocumentQueryResult extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	Name: string = null;
	Created: DateTime = null;
	OperatingLocationID: string = null;
	Orders: OrderDTO[] = null;
	TicketNumber: number = 0;
	ParkingDays: number = 0;
	IntakeMeetValetDateTime: DateTime = null;
	IntakeMeetValetLocation: string = null;
	IntakeSpecification: string = null;
	GiveBackDateTime: DateTime = null;
	GiveBackSpecification: string = null;
	ReservationNote: string = null;
	NoteToCustomer: string = null;
	FeeName: string = null;
	IntakeName: string = null;
	GiveBackName: string = null;
	TotalParking: number = 0;
	AdditionalServiceLineItems: OrderLineItemDTO[] = null;
	TotalAdditionalService: number = 0;
	PromotionCodesUsed: string = null;
	RewardNamesUsed: string = null;
	TotalPreTax: number = 0;
	TaxOnly: number = 0;
	FeeOnly: number = 0;
	Tip: number = 0;
	TipLineItems: OrderLineItemDTO[] = null;
	Total: number = 0;
	PointsEarned: number = 0;
	IsChargesPrepared: boolean = false;
	constructor()
	{
		super();
	}
}
class BillingTotalSummaryDTO extends NObject
{
	ID: string = null;
	TicketNumber: number = 0;
	ParkingDays: number = 0;
	TotalParking: number = 0;
	AdditionalServiceLineItems: OrderLineItemDTO[] = null;
	TotalAdditionalService: number = 0;
	PromotionCodesUsed: string = null;
	TotalPreTax: number = 0;
	TaxOnly: number = 0;
	FeeOnly: number = 0;
	Tip: number = 0;
	Total: number = 0;
	HasReceipt: boolean = false;
	BillingDocumentName: string = null;
	ReceiptHTMLURL: string = null;
	RefundedTotal: number = 0;
	RefundedParkingTotal: number = 0;
	RefundedParkingFeeOnly: number = 0;
	RefundedParkingTaxOnly: number = 0;
	RefundedAdditionalServiceLineItems: OrderLineItemDTO[] = null;
	NetTotalProfit: number = 0;
	constructor()
	{
		super();
	}
}
class FlattenedEstimateDTO extends NObject
{
	ReservationNumber: number = 0;
	DepartureMeetValetDateTime: string = null;
	DepartureMeetValetLocation: string = null;
	DepartureInformation: string = null;
	ReturnDateTime: string = null;
	ReturnInformation: string = null;
	ReservationNote: string = null;
	NoteToCustomer: string = null;
	EstimateTotalPreTax: number = 0;
	EstimateTotalAfterTax: number = 0;
	EstimateTaxOnly: number = 0;
	ParkingDays: number = 0;
	PointsEarned: number = 0;
	BillingDocumentName: string = null;
	BillingDocumentPDFURL: string = null;
	BillingDocumentHTMLURL: string = null;
	OrdersPaymentDescription: string = null;
	OrdersPaymentNote: string = null;
	OrdersPaymentType: string = null;
	OrdersTotalWithTaxAndFee: number = 0;
	OrdersOrderTaxOnly: number = 0;
	OrdersOrderFeeOnly: number = 0;
	OrdersOrderFeeName: string = null;
	LineItemType: string = null;
	LineItemDescription: string = null;
	LineItemQuantity: number = 0;
	LineItemAmountPerEach: number = 0;
	LineItemLineTotal: number = 0;
	LineItemFeeRate: number = 0;
	LineItemTaxRate: number = 0;
	TipAmount: number = 0;
	constructor()
	{
		super();
	}
}
class OrderDTO extends NObject
{
	PaymentDescription: string = null;
	LineItems: OrderLineItemDTO[] = null;
	AdditionalServiceLineItems: OrderLineItemDTO[] = null;
	OrderTotalParking: number = 0;
	OrderTaxOnly: number = 0;
	OrderFeeOnly: number = 0;
	OrderTotalWithTaxAndFee: number = 0;
	OrderTip: number = 0;
	constructor()
	{
		super();
	}
}
class OrderLineItemDTO extends NObject
{
	LinkedToID: string = null;
	LineItemType: string = null;
	LineItemSubType: string = null;
	Description: string = null;
	Quantity: number = 0;
	AmountPerEach: number = 0;
	TaxRate: number = 0;
	FeeRate: number = 0;
	LineTotalBeforeTaxAndFee: number = 0;
	Tip: PercentOrFlatAmountDTO = null;
	constructor()
	{
		super();
	}
}
class OrderLineItemDTOWithLineTotal extends OrderLineItemDTO
{
	LineTotalWithTaxAndFee: number = 0;
	constructor()
	{
		super();
	}
}
class FlightSpecificationsDTO extends NObject
{
	AirportCode: string = null;
	AirlineCode: string = null;
	FlightNumber: string = null;
	FlightDirection: FlightDirection = 0;
	DateUsedToCalculateMeetTime: string = null;
	constructor()
	{
		super();
	}
}
class FlightStatusDTO extends NObject
{
	BaggageClaim: string = null;
	StatusCode: FlightStatusCode = 0;
	FlightTimeSource: string = null;
	FlightTime: string = null;
	TerminalGate: string = null;
	UpdatedOn: string = null;
	UpdatedFromProvider: string = null;
	constructor()
	{
		super();
	}
}
class ScheduleDTO extends NObject
{
	ScheduleDateTime: string = null;
	constructor()
	{
		super();
	}
}
class AccountDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	ContactInformation: ContactInformationDTO = null;
	IsActivated: boolean = false;
	LegacyUserName: string = null;
	DefaultOperatingLocationID: string = null;
	PaymentGatewayCustomerProfileID: number = 0;
	CCEmails: string = null;
	IsSalesTaxExempt: boolean = false;
	DefaultPromoCode: string = null;
	DefaultMeetLocationIntake: string = null;
	Company: string = null;
	OfficeNote: string = null;
	NoteToValets: string = null;
	LearnedAboutUsFrom: string = null;
	ReferredBy: string = null;
	FriendlyName: string = null;
	constructor()
	{
		super();
	}
}
class AgentDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	AccountIDs: string[] = null;
	constructor()
	{
		super();
	}
}
class AgentQueryResult extends NObject
{
	ID: string = null;
	Accounts: AccountDTO[] = null;
	AccountIDs: string[] = null;
	constructor()
	{
		super();
	}
}
class EmailDTO extends NObject
{
	EmailAddress: string = null;
	constructor()
	{
		super();
	}
}
class NameDTO extends NObject
{
	First: string = null;
	Last: string = null;
	Middle: string = null;
	Prefix: string = null;
	Suffix: string = null;
	FriendlyName: string = null;
	LastThenFirst: string = null;
	FirstNameOrPrefixAndLastName: string = null;
	constructor()
	{
		super();
	}
}
class PhoneNumberDTO extends NObject
{
	Note: string = null;
	Number: string = null;
	constructor()
	{
		super();
	}
}
class VehicleDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	AccountID: string = null;
	Nickname: string = null;
	LicensePlate: string = null;
	LicenseAgency: string = null;
	Make: string = null;
	Model: string = null;
	Year: Nullable<number> = null;
	Color: string = null;
	UseTollTag: boolean = false;
	Attributes: string = null;
	FriendlyName: string = null;
	constructor()
	{
		super();
	}
}
class AddressDTO extends NObject
{
	Line1: string = null;
	Line2: string = null;
	City: string = null;
	State: string = null;
	PostalCode: string = null;
	Country: string = null;
	FriendlyName: string = null;
	constructor()
	{
		super();
	}
}
class ContactInformationDTO extends NObject
{
	Name: NameDTO = null;
	MobilePhone: PhoneNumberDTO = null;
	MailingAddress: AddressDTO = null;
	Email: EmailDTO = null;
	MorePhones: PhoneNumberDTO[] = null;
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_AppConfigurationMethods extends NObject
{
	static Brand: string = "Brand/{key}/{platform}";
	static Infrastructure: string = "Infrastructure/{key}/{platform}";
	static Tips: string = "Tips/{tag}/{totalCostBase}";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_OperatingLocationMethods extends NObject
{
	static GetTieredRatesForOperatingLocationID: string = "GetTieredRatesForOperatingLocationID";
	static CreateOperatingLocation: string = "CreateOperatingLocation";
	static GetByCustomerCode: string = "GetByCustomerCode";
	static GetByCustomerCodeThatTakeReservations: string = "GetByCustomerCodeThatTakeReservations";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_ChangePasswordMethods extends NObject
{
	static Staff: string = "Staff";
	static Customer: string = "Customer";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_ResetPasswordMethods extends NObject
{
	static ResetPasswordTo: string = "ResetPasswordTo";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_ManufactureMethods extends NObject
{
	static GetAllMakes: string = "GetAllMakes";
	static GetAllModelsByMake: string = "GetAllModelsByMake";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_VehicleMethods extends NObject
{
	static GetByAccountID: string = "GetByAccountID";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_PaymentMethodMethods extends NObject
{
	static GetByAccountID: string = "GetByAccountID";
	static UpdatePayment: string = "UpdatePayment";
	static ChargeCreditCardOnDemand: string = "ChargeCreditCardOnDemand";
	static AuthorizePaymentMethod: string = "AuthorizePaymentMethod";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_AccountMethods extends NObject
{
	static GetByEmail: string = "GetByEmail";
	static GetByPhoneNumber: string = "GetByPhoneNumber";
	static GetByLegacyUserName: string = "GetByLegacyUserName";
	static CreateMigratedCustomer: string = "CreateMigratedCustomer";
	static CreatePassword: string = "CreatePassword";
	static Signup: string = "Signup";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_AccountAddressMethods extends NObject
{
	static GetAccountMailingAddressRoute: string = "{id}/MailingAddress";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_ReservationMethods extends NObject
{
	static CreateReservationAndBilling: string = "CreateReservationAndBilling";
	static CreateReservationAndBillingInOneStep: string = "CreateReservationAndBillingInOneStep";
	static ImportReservation: string = "ImportReservation";
	static UpdateReservationAndBilling: string = "UpdateReservationAndBilling";
	static UpdateReservation: string = "UpdateReservation";
	static GetByAccountID: string = "GetByAccountID";
	static GetParkingDays: string = "GetParkingDays";
	static AuthorizeAndUpdateReservationAndBilling: string = "AuthorizeAndUpdateReservationAndBilling";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_ReservationStatusChangeMethods extends NObject
{
	static MakePending: string = "MakePending";
	static MakeCancelled: string = "MakeCancelled";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_ReceiptMethods extends NObject
{
	static GetReceipt: string = "GetReceipt";
	static SendSavedReceipt: string = "SendSavedReceipt";
	static GetReceiptUrl: string = "GetReceiptUrl";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_EstimateForTicketMethods extends NObject
{
	static GetEstimate: string = "GetEstimate";
	static SendSavedEstimate: string = "SendSavedEstimate";
	static GetEstimateUrl: string = "GetEstimateUrl";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_EstimateForReservationMethods extends NObject
{
	static GenerateEstimate: string = "GenerateEstimate";
	static GetEstimateBillingTotalSummary: string = "GetEstimateBillingTotalSummary";
	static GetEstimateUrl: string = "GetEstimateUrl";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_BillingDocumentForTicketMethods extends NObject
{
	static GetBillingCostBreakdown: string = "GetBillingCostBreakdown";
	static GetBillingTotalSummary: string = "GetBillingTotalSummary";
	static GetOriginalBillingTotalSummary: string = "GetOriginalBillingTotalSummary";
	static GetOriginal: string = "GetOriginal";
	static GetOriginalUrl: string = "GetOriginalUrl";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_BillingMethods extends NObject
{
	static GetPaymentNicknamesForBothOrders: string = "GetPaymentNicknamesForBothOrders";
	static HasTipOnReservation: string = "HasTipOnReservation";
	static RegenerateBilling: string = "RegenerateBilling";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_BillingCommandMethods extends NObject
{
	static AddRefundsForBothOrders: string = "AddRefundsForBothOrders";
	static AddTipsForBothOrders: string = "AddTipsForBothOrders";
	static ChangePaymentMethod: string = "ChangePaymentMethod";
	static ProcessRefund: string = "ProcessRefund";
	static AddReservedService: string = "AddReservedService";
	static UpdateReservedService: string = "UpdateReservedService";
	static DeleteReservedService: string = "DeleteReservedService";
	static UpdateReservedServiceProviderCharge: string = "UpdateReservedServiceProviderCharge";
	static UpdateReservedServiceNote: string = "UpdateReservedServiceNote";
	static PrepareCharges: string = "PrepareCharges";
	static AttemptToProcessCharges: string = "AttemptToProcessCharges";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_TicketTipMethods extends NObject
{
	static GetTipMessage: string = "GetTipMessage";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_TipMethods extends NObject
{
	static GetThisWeekTipSum: string = "ThisWeek";
	static GetLastWeekTipSum: string = "LastWeek";
	static GetThisMonthTipSum: string = "ThisMonth";
	static GetLastMonthTipSum: string = "LastMonth";
	static GetForDates: string = "ForDates";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_PointsAccountingMethods extends NObject
{
	static GetByAccountID: string = "GetByAccountID";
	static GetByAccountIDExtended: string = "GetByAccountIDExtended";
	static GetByReservationID: string = "GetByReservationID";
	static GetSummaryByAccountID: string = "GetSummaryByAccountID";
	static CreateDirectlyFromDTO: string = "CreateDirectlyFromDTO";
	static GetAllPendingExtended: string = "GetAllPendingExtended";
	static MakeCompleted: string = "MakeCompleted";
	static UpdateNotes: string = "UpdateNotes";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_EntranceMethods extends NObject
{
	static GetByOperatingLocationIDByName: string = "GetByOperatingLocationIDByName";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_ReportRoutes extends NObject
{
	static CountReservationCreatedBy: string = "CountReservationCreatedBy";
	static CountActiveTicket: string = "CountActiveTicket";
	static AllCounts: string = "AllCounts";
	static EstimatedRevenueSummary: string = "EstimatedRevenueSummary";
	static EstimatedRevenueSummaryToInfinity: string = "EstimatedRevenueSummaryToInfinity";
	static RevenueSummary: string = "RevenueSummary";
	static RevenueByServiceCategory: string = "RevenueByServiceCategory";
	static RefundsByCategory: string = "RefundsByCategory";
	static AverageTimeToDeliver: string = "AverageTimeToDeliver";
	static ParkedPerDay: string = "ParkedPerDay";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_ZoneMethods extends NObject
{
	static FindBestAvailableSlot: string = "FindBestAvailableSlot";
	static GetByOperatingLocationID: string = "GetByOperatingLocationID";
	static GetByOperatingLocationIDAsMatrix: string = "GetByOperatingLocationIDAsMatrix";
	static UpdateFromZoneSpreadsheet: string = "UpdateFromZoneSpreadsheet";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_LotMethods extends NObject
{
	static GetByOperatingLocationID: string = "GetByOperatingLocationID";
	static GetSpreadsheetByOperatingLocationID: string = "GetSpreadsheetByOperatingLocationID";
	static UpdateFromSpreadsheet: string = "UpdateFromSpreadsheet";
	static GetInvalidSlotAttributes: string = "GetInvalidSlotAttributes";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_OfferedServiceMethods extends NObject
{
	static GetByServiceName: string = "GetByServiceName";
	static GetServicesAvailableInTimeframe: string = "GetServicesAvailableInTimeframe";
	static GetServicesAvailableInTimeframeForCustomer: string = "GetServicesAvailableInTimeframeForCustomer";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_PromotionMethods extends NObject
{
	static GetByOperatingLocationID: string = "GetByOperatingLocationID";
	static GetByPromotionCode: string = "GetByPromotionCode";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_PromotionDiscountMethods extends NObject
{
	static GetByPromotionID: string = "GetByPromotionID";
	static GetFriendlyName: string = "GetFriendlyName";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_RewardMethods extends NObject
{
	static GetAvailable: string = "GetAvailable";
	static GetByName: string = "GetByName";
	static GetAvailableGiftRewards: string = "GetAvailableGiftRewards";
	static GetAvailableNonGiftRewards: string = "GetAvailableNonGiftRewards";
	static GetManagementReward: string = "GetManagementReward";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing_CommonMethods extends NObject
{
	static GetByID: string = "GetByID";
	static Upsert: string = "Upsert";
	constructor()
	{
		super();
	}
}
class CommonConfiguration_Routing extends NObject
{
	static AppConfigurationRoute: string = "AppConfiguration";
	static CustomerProfilePictureRoute: string = "CustomerProfilePicture";
	static NewPaymentCardRoute: string = "NewPaymentCard";
	static CommunicationRoute: string = "Communication";
	static TimesheetRoute: string = "Timesheet";
	static TemplateRoute: string = "Template";
	static TemplateContentWithTemplateRoute: string = "TemplateContentWithTemplate";
	static DocumentBuilderDocumentRoute: string = "DocumentBuilderDocument";
	static NumberGeneratorRoute: string = "NumberGenerator";
	static IssueEventsRoute: string = "IssueEvents";
	static TimesheetEventsRoute: string = "TimesheetEvents";
	static ServiceAvailabilityRoute: string = "ServiceAvailability";
	static DefinedListRoute: string = "DefinedList";
	static OperatingLocationRoute: string = "OperatingLocation";
	static ChangePasswordRoute: string = "ChangePassword";
	static ResetPasswordRoute: string = "ResetPassword";
	static EmployeeRoute: string = "Employee";
	static ProfileImageRoute: string = "ProfileImage";
	static ManufactureRoute: string = "Manufacture";
	static VehicleRoute: string = "Vehicle";
	static PaymentMethodRoute: string = "PaymentMethod";
	static AccountRoute: string = "Account";
	static AccountAddressRoute: string = "Account";
	static AgentRoute: string = "Agent";
	static ReservationRoute: string = "Reservation";
	static ReservationStatusChangeRoute: string = "ReservationStatusChange";
	static ReceiptRoute: string = "Receipt";
	static RefundReceiptRoute: string = "RefundReceipt";
	static EstimateForTicketRoute: string = "EstimateForTicket";
	static EstimateForReservationRoute: string = "EstimateForReservation";
	static BillingDocumentForTicketRoute: string = "BillingDocumentForTicket";
	static BillingRoute: string = "Billing";
	static BillingCommandRoute: string = "BillingCommand";
	static AdjustmentRoute: string = "Adjustment";
	static RefundRoute: string = "Refund";
	static TicketTipRoute: string = "TicketTip";
	static TipRoute: string = "Tip";
	static TipSumRoute: string = "TipSum";
	static ValetTipRoute: string = "ValetTip";
	static ValetTipSumRoute: string = "ValetTipSum";
	static SplitPaymentRoute: string = "SplitPayment";
	static PointsAccountingRoute: string = "PointsAccounting";
	static EntranceRoute: string = "Entrance";
	static ZoneRoute: string = "Zone";
	static LotRoute: string = "Lot";
	static OfferedServiceRoute: string = "OfferedService";
	static PromotionRoute: string = "Promotion";
	static PromotionDiscountRoute: string = "PromotionDiscount";
	static RewardRoute: string = "Reward";
	constructor()
	{
		super();
	}
}
