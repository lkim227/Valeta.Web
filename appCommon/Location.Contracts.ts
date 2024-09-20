///<reference path='mscorlib.ts'/>
class GeoFenceBox extends NObject
{
	TopLeft: GeoLocation = null;
	BottomLeft: GeoLocation = null;
	BottomRight: GeoLocation = null;
	TopRight: GeoLocation = null;
	constructor()
	{
		super();
	}
}
class GeoLocation extends NObject
{
	Latitude: number = 0;
	Longitude: number = 0;
	constructor()
	{
		super();
	}
}
class MapDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	FriendlyID: string = null;
	RelatedGroupID: string = null;
	BoxBoundary: GeoFenceBox = null;
	ImageUrl: string = null;
	ImageWidth: number = 0;
	ImageHeight: number = 0;
	constructor()
	{
		super();
	}
}
class PositionXY extends NObject
{
	X: number = 0;
	Y: number = 0;
	constructor()
	{
		super();
	}
}
class ResourceLastKnownLocationDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	RelatedGroupID: string = null;
	ResourceID: string = null;
	ResourceFriendlyID: string = null;
	Note: string = null;
	DeviceCode: string = null;
	GeoLocation: GeoLocation = null;
	LocationReportedOn: string = null;
	LocationReportedOnDate: DateTime = null;
	constructor()
	{
		super();
	}
}
class ResourceLastKnownLocationForMapDTO extends ResourceLastKnownLocationDTO
{
	PositionXY: PositionXY = null;
	constructor()
	{
		super();
	}
}
