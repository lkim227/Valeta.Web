///<reference path='mscorlib.ts'/>
enum MessageType
{
	Email,
	Sms
}
class DocumentParametersDTO extends NObject
{
	TemplateName: string = null;
	Group: string = null;
	MergeLookups: MergeLookupDTO[] = null;
	MergeFieldWithValues: MergeFieldWithValueDTO[] = null;
	constructor()
	{
		super();
	}
}
class DocumentResultDTO extends NObject
{
	Content: string = null;
	Subject: string = null;
	TemplateWasFound: boolean = false;
	IncludedImageUrl: string = null;
	constructor()
	{
		super();
	}
}
class MergeFieldWithValueDTO extends NObject
{
	Name: string = null;
	Value: string = null;
	constructor()
	{
		super();
	}
}
class MergeLookupDTO extends NObject
{
	RootName: string = null;
	Uri: string = null;
	constructor()
	{
		super();
	}
}
class TemplateContentDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	TemplateID: string = null;
	Group: string = null;
	Subject: string = null;
	Content: string = null;
	Updated: string = null;
	UpdatedBy: string = null;
	constructor()
	{
		super();
	}
}
class TemplateContentWithTemplateDTO extends NObject
{
	TemplateContentID: string = null;
	Template: TemplateDTO = null;
	TemplateContent: TemplateContentDTO = null;
	constructor()
	{
		super();
	}
}
class TemplateDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	TemplateName: string = null;
	MessageType: MessageType = 0;
	MergeFields: MergeFieldDTO[] = null;
	constructor()
	{
		super();
	}
}
class MergeFieldDTO extends NObject
{
	FriendlyName: string = null;
	FullyQualifiedName: string = null;
	constructor()
	{
		super();
	}
}
