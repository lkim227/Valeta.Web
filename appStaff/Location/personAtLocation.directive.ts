module AppStaff {
    export interface IPersonAtLocationAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IPersonAtLocationScope extends ng.IScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        
        formMessages: any;
        utils: AppCommon.GenericUtils;
        enumUtils: AppCommon.EnumUtils;
        
        gridOptions: any;
    }

    class PersonAtLocationDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommon.AppCommonConfig.kendoGridBaseUrl;
        scope = {
        
        };

        static $inject = ["SessionService", "LocationRepository"];

        constructor(private sessionService: AppCommon.SessionService,
            private locationRepository: LocationRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IPersonAtLocationScope, elements: ng.IAugmentedJQuery, attrs: IPersonAtLocationAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;
            scope.utils = AppCommon.GenericUtils;
            scope.enumUtils = AppCommon.EnumUtils;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canCreate = getBooleanAttribute(attrs.canCreate);
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate);
            scope.canDelete = getBooleanAttribute(attrs.canDelete);

            //build datasource
            var schema = {
                model: {
                    id: "ID",
                    fields: {
                        ID: { editable: false },
                        ResourceID: { editable: false },
                        ResourceFriendlyID: { editable: false },
                        Note: { editable: false },
                        GeoLocation: {
                            editable: false,
                            fields: {
                                Latitude: { editable: false },
                                Longitude: { editable: false }
                            }
                        },
                        Updated: { editable: false }
                    }
                }
            };
            var dataSource = AppCommon.KendoDataSourceFactory.createKendoDataSource("LastKnownLocation", schema, null, null);
            
            //build grid
            var filterable = "true";
            var columns = [
                { field: "ID", hidden: true },
                { field: "ResourceFriendlyID", title: "Valet", width: "150px" },
                { field: "Note", title: "Information" },
                { field: "GeoLocation", title: "Geo Coordinates", template: "#= GeoLocation.Latitude + ', ' + GeoLocation.Longitude #" },
                { field: "Updated", title: "Last Updated" }//, template: "#= !!Updated ? kendo.toString(kendo.parseDate(Updated), \"g\") : '' #" }
            ];
            scope.gridOptions = AppCommon.KendoFunctions.getGridOptions(
                dataSource,
                "Location",
                scope.canCreate,
                scope.canUpdate,
                filterable,
                columns);
        };

    }

    angular.module("app.staff")
        .directive("personAtLocation",
        ["SessionService", "LocationRepository", (s, lRepo) => new PersonAtLocationDirective(s, lRepo)]);
}