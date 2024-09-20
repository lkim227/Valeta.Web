///<reference path='mscorlib.ts'/>
class LocalPhotoSet extends NObject
{
	FullsizeFileName: string = null;
	ThumbnailFileName: string = null;
	ImageType: string = null;
	constructor()
	{
		super();
	}
}
class UriPhotoSet extends NObject
{
	FullsizeUri: string = null;
	ThumbnailUri: string = null;
	ImageType: string = null;
	constructor()
	{
		super();
	}
}
class VehicleDamageCheckPhotoDTO extends NObject
{
	TransactionID: string = null;
	LocalPhotoSet: LocalPhotoSet = null;
	Description: string = null;
	TicketNumber: number = 0;
	CreatedBy: string = null;
	CreatedOnDeviceCode: string = null;
	DateCreated: string = null;
	constructor()
	{
		super();
	}
}
class VehicleDamageMarkDTO extends NObject
{
	TicketNumber: number = 0;
	Index: number = 0;
	HasImages: boolean = false;
	LocalPhotoSet: LocalPhotoSet = null;
	Description: string = null;
	DiagramLocationX: number = 0;
	DiagramLocationY: number = 0;
	CreatedBy: string = null;
	CreatedOnDeviceCode: string = null;
	DateCreated: string = null;
	constructor()
	{
		super();
	}
}
class VehicleDamageSignatureDTO extends NObject
{
	TransactionID: string = null;
	FileName: string = null;
	ImageUrl: string = null;
	TicketNumber: number = 0;
	CreatedBy: string = null;
	CreatedOnDeviceCode: string = null;
	DateCreated: string = null;
	constructor()
	{
		super();
	}
}
