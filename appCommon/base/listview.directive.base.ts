module AppCommon {
    export interface IListViewDirectiveBaseAttributes extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
        canSelect: string;
    }

    export interface IListViewDirectiveBaseScope extends ng.IScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        canSelect: boolean;

        loadingPromise: ng.IPromise<any>;
        cgBusyConfiguration: any;

        dataSource: kendo.data.DataSource;
    }

    export class ListViewDirectiveBase implements ng.IDirective {
        restrict = "E";

        getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

        initializeScope(scope: IListViewDirectiveBaseScope, attrs: IListViewDirectiveBaseAttributes): void {
            scope.canCreate = this.getBooleanAttribute(attrs.canCreate);
            scope.canUpdate = this.getBooleanAttribute(attrs.canUpdate);
            scope.canDelete = this.getBooleanAttribute(attrs.canDelete);
            scope.canSelect = this.getBooleanAttribute(attrs.canSelect);

            scope.cgBusyConfiguration = { promise: scope.loadingPromise, message: "Loading..." };
        }
    }
}