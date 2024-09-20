module AppStaff {
    export interface IDispatchFilterAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IDispatchFilterScope extends ng.IScope {
        selectedOperatingLocation: OperatingLocationDTO;
        onChangeOperatingLocation(newOperatingLocation: OperatingLocationDTO): void;

        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;

        formMessages: any;
        utils: AppCommon.GenericUtils;
        enumUtils: AppCommon.EnumUtils;

        connection: SignalR.Hub.Connection;
        hubTicket: SignalR.Hub.Proxy;
        countOfTicketChangesSinceLastRefresh: number;
        refreshData(): void;
        hubStart: any;
        refreshButtonCounterDataSource: kendo.data.DataSource;
        ticketDataSource: kendo.data.DataSource;

        gridOptions: any;
    }

    class DispatchFilterDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "Dispatch/dispatchFilter.directive.html";
        scope = {

        };

        static $inject = ["SessionService", "ValetServiceCommand", "KendoDataSourceService"];

        constructor(private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand,
            private kendoDataSourceService: AppCommon.KendoDataSourceService) {
        }

        link: ng.IDirectiveLinkFn = (scope: IDispatchFilterScope, elements: ng.IAugmentedJQuery, attrs: IDispatchFilterAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;
            scope.utils = AppCommon.GenericUtils;
            scope.enumUtils = AppCommon.EnumUtils;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canCreate = getBooleanAttribute(attrs.canCreate);
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate);
            scope.canDelete = getBooleanAttribute(attrs.canDelete);

            scope.onChangeOperatingLocation = (newOperatingLocation: OperatingLocationDTO): void => {

                scope.selectedOperatingLocation = newOperatingLocation;

                if (scope.selectedOperatingLocation == null || typeof scope.selectedOperatingLocation == "undefined") return;
            };
            
        };

    }

    angular.module("app.staff")
        .directive("dispatchFilter",
        ["SessionService", "ValetServiceCommand", "KendoDataSourceService",
            (s, vsc, k) => new DispatchFilterDirective(s, vsc, k)]);
}