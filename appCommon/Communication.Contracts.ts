///<reference path='mscorlib.ts'/>
enum MessageStatus
{
	Requested,
	Queueing,
	Queued,
	QueueFailed
}
class CommunicationEventHappenedDTO extends NObject
{
	Status: MessageStatus = 0;
	ProviderResponse: ProviderResponseDTO = null;
	constructor()
	{
		super();
	}
}
class EmailMessageDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	UpdatedOn: string = null;
	UpdatedBy: string = null;
	MessageStatus: MessageStatus = 0;
	EmailHeaders: EmailHeadersDTO = null;
	MessageContext: MessageContextDTO = null;
	PlainTextMessage: string = null;
	HtmlMessage: string = null;
	HtmlAddendumFilename: string = null;
	AttachmentFileURL: string = null;
	constructor()
	{
		super();
	}
}
class MessageBlockDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	TemplateName: string = null;
	constructor()
	{
		super();
	}
}
class MessageDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	Updated: string = null;
	UpdatedBy: string = null;
	MessageStatus: MessageStatus = 0;
	MessageContext: MessageContextDTO = null;
	To: string = null;
	Content: string = null;
	constructor()
	{
		super();
	}
}
class SmsMessageDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	Updated: string = null;
	UpdatedBy: string = null;
	Status: MessageStatus = 0;
	Options: SmsOptionsDTO = null;
	MessageContext: MessageContextDTO = null;
	ProviderCommandResult: ProviderCommandResultDTO = null;
	constructor()
	{
		super();
	}
}
class EmailHeadersDTO extends NObject
{
	ToAddress: string = null;
	ToName: string = null;
	Subject: string = null;
	CCEmails: string = null;
	constructor()
	{
		super();
	}
}
class EmailServerOptionsDTO extends NObject
{
	Server: string = null;
	Port: number = 0;
	UseSsl: boolean = false;
	RequiresAuthentication: boolean = false;
	User: string = null;
	Password: string = null;
	DefaultFromAddress: string = null;
	DefaultFromName: string = null;
	constructor()
	{
		super();
	}
}
class MessageContextDTO extends NObject
{
	Name: string = null;
	Identifier: string = null;
	FriendlyIdentifier: string = null;
	TemplateName: string = null;
	Group: string = null;
	constructor()
	{
		super();
	}
}
class ProviderCommandResultDTO extends NObject
{
	CommandWasSuccessful: boolean = false;
	CommandMessage: string = null;
	ProviderCode: string = null;
	ProviderDescription: string = null;
	ProviderResponse: ProviderResponseDTO = null;
	constructor()
	{
		super();
	}
}
class ProviderResponseDTO extends NObject
{
	ProviderWasSuccessful: boolean = false;
	StatusCode: number = 0;
	ResponsePhrase: string = null;
	Data: string = null;
	constructor()
	{
		super();
	}
}
class SmsOptionsDTO extends NObject
{
	ToMobile: string = null;
	Message: string = null;
	PreferredProviderCode: string = null;
	IncludedImageUrl: string = null;
	constructor()
	{
		super();
	}
}
class SendEmailCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	MessageContext: MessageContextDTO = null;
	EmailHeaders: EmailHeadersDTO = null;
	HtmlMessage: string = null;
	PlainTextMessage: string = null;
	AttachmentFileURL: string = null;
	HtmlAddendumFilename: string = null;
	constructor()
	{
		super();
	}
}
class SendSmsCommandDTO extends NObject
{
	ID: string = null;
	CreatedBy: string = null;
	MessageContext: MessageContextDTO = null;
	Options: SmsOptionsDTO = null;
	constructor()
	{
		super();
	}
}
