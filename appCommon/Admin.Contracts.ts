///<reference path='mscorlib.ts'/>
class ReferralDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	Address: ReferralAddressDTO = null;
	Email: string = null;
	FirstName: string = null;
	LastName: string = null;
	Vehicle: ReferralVehicleDTO = null;
	Phone: string = null;
	constructor()
	{
		super();
	}
}
class ReferralAddressDTO extends NObject
{
	Address: string = null;
	City: string = null;
	State: string = null;
	Zip: string = null;
	constructor()
	{
		super();
	}
}
class ReferralVehicleDTO extends NObject
{
	Make: string = null;
	Model: string = null;
	Year: number = 0;
	LicensePlate: string = null;
	constructor()
	{
		super();
	}
}
class EmployeeDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	FriendlyID: string = null;
	IsArchived: boolean = false;
	ContactInformation: ContactInformationDTO = null;
	PrimaryRoleID: string = null;
	ValetAppPinCode: string = null;
	Password: string = null;
	Badge: string = null;
	constructor()
	{
		super();
	}
}
class PaymentMethodDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	AccountID: string = null;
	PaymentGatewayPaymentID: number = 0;
	Type: string = null;
	Note: string = null;
	PaymentGatewayFields: PaymentGatewayFieldsDTO = null;
	IsAuthorized: boolean = false;
	IsExpired: boolean = false;
	FriendlyName: string = null;
	BillingAddress: AddressDTO = null;
	constructor()
	{
		super();
	}
}
class UpdatedPaymentCardDTO extends NObject
{
	PaymentMethod: PaymentMethodDTO = null;
	ExpirationMonthAndYear: string = null;
	CCV: string = null;
	constructor()
	{
		super();
	}
}
class CreditCardOnDemandDTO extends NObject
{
	TicketID: string = null;
	TicketNumber: number = 0;
	PaymentCard: PaymentCardDTO = null;
	ChargeName: string = null;
	ChargeAmount: number = 0;
	constructor()
	{
		super();
	}
}
class NewPaymentCardDTO extends NObject
{
	AccountID: string = null;
	CardNumber: string = null;
	ExpirationMonthAndYear: string = null;
	CCV: string = null;
	Note: string = null;
	BillingAddress: AddressDTO = null;
	constructor()
	{
		super();
	}
}
class PaymentCardDTO extends NObject
{
	CardholderName: string = null;
	CardNumber: string = null;
	RedactedCardNumber: string = null;
	ExpirationMonth: number = 0;
	ExpirationYear: number = 0;
	CCV: string = null;
	PostalCode: string = null;
	constructor()
	{
		super();
	}
}
class PaymentGatewayFieldsDTO extends NObject
{
	LastFourDigitsOfCardNumber: string = null;
	ExpirationMonth: number = 0;
	ExpirationYear: number = 0;
	constructor()
	{
		super();
	}
}
