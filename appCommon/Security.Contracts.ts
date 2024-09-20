///<reference path='mscorlib.ts'/>
enum AccessLevel
{
	None,
	View = 3,
	Edit = 7,
	Superuser = 10
}
class APIToken extends NObject
{
	access_token: string = null;
	expires_in: number = 0;
	token_type: string = null;
	scope: string = null;
	refresh_token: string = null;
	refresh_expires_in: number = 0;
	download_token: string = null;
	constructor()
	{
		super();
	}
}
class LoginCredential extends NObject
{
	Grant_Type: string = null;
	Username: string = null;
	Password: string = null;
	constructor()
	{
		super();
	}
}
class RightsRolesDTO extends NObject
{
	ID: string = null;
	RightName: string = null;
	RoleName: string = null;
	AccessLevel: number = 0;
	IsEditable: boolean = false;
	constructor()
	{
		super();
	}
}
class UserInfo extends NObject
{
	expires: string = null;
	access_token: string = null;
	token_type: string = null;
	customerAccountID: string = null;
	employeeID: string = null;
	employeeFriendlyID: string = null;
	customerFriendlyID: string = null;
	userID: string = null;
	userName: string = null;
	userRoles: string[] = null;
	UserRights: UserRightDTO[] = null;
	constructor()
	{
		super();
	}
}
class UserRightDTO extends NObject
{
	RightName: string = null;
	AccessLevel: number = 0;
	constructor()
	{
		super();
	}
}
class UserRoleDTO extends NObject
{
	UserID: string = null;
	RoleName: string = null;
	IsUserInRole: boolean = false;
	constructor()
	{
		super();
	}
}
