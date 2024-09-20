///<reference path='mscorlib.ts'/>
class IncrementalIntegerDTO extends NObject implements IDTOEntity
{
	ID: string = null;
	IsArchived: boolean = false;
	Number: number = 0;
	Tag: string = null;
	GeneratedOn: DateTime = null;
	constructor()
	{
		super();
	}
}
