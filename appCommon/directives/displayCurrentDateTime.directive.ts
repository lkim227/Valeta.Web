// Example usage:
// <display-current-date-time id="currentDateTime" format="h:mm:ss a" interval="500" > </display-current-date-time>
// id: required (but does not have to be set to currentDateTime)
// format: format string for angular date
// interval: number of milliseconds between updates

module AppCommon {
    var directiveName = "displayCurrentDateTime";

    export interface IDisplayCurrentDateTimeScope extends ng.IScope {
    }

    class DisplayCurrentDateTimeDirective implements ng.IDirective {
        restrict = "E";
        scope = {
            id: "@",
            format: "@",
            interval: "@"
        };

        static $inject = ["dateFilter"];

        constructor(private dateFilter: ng.IFilterDate) {
        }

        link: ng.IDirectiveLinkFn = (scope: IDisplayCurrentDateTimeScope, elements: ng.IAugmentedJQuery, attrs: ng.IAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;

            var idAttr = "id";
            var id = attrs[idAttr];
            if (!id) {
                throw "Missing required attribute: " + idAttr;
            }
            var currentDateTimeElement = document.getElementById(id);
            if (!currentDateTimeElement) {
                throw "Could not find element " + idAttr + "=" + id;
            }

            var format: string = attrs["format"];
            if (!format) {
                format = AppCommonConfig.uiDateTimeFormat;
            }

            var interval: number = attrs["interval"];
            if (!interval) {
                interval = 500;
            }

            var updateCurrentDateTime = () => {
                if (!!currentDateTimeElement) {
                    var now = new Date();
                    currentDateTimeElement.innerHTML = self.dateFilter(now, format);
                    currentDateTimeElement.setAttribute('datetime', self.dateFilter(now, AppCommonConfig.isoDateTimeFormat));
                }
            };

            setInterval(updateCurrentDateTime, interval);
        }
    }

    angular.module("app.common")
        .directive(directiveName,
        ["dateFilter", (df) => new DisplayCurrentDateTimeDirective(df)]);
}