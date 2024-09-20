module AppCommon {
    import utils = AppCommon.GenericUtils;

    export interface IDateFromToAttributes extends ng.IAttributes {
    }

    export interface IDateFromToScope extends ng.IScope {
        strFromDateTime: string;
        strToDateTime: string;
        objFromDateTime: Date;
        objToDateTime: Date;

        //out to other directives to filter on
        fromDateTime: string;
        toDateTime: string;
        showFullDays: boolean;

        onChangeFromDate(): void;
        onChangeToDate(): void;
    }

    class DateFromToDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.dateFromToTemplateUrl;
        scope = {
            fromDateTime: "=",
            toDateTime: "=",
            showFullDays: "="
        };

        static $inject = ["$window", "$timeout", "SessionService", "dateFilter"];

        constructor(
            private $window: Window,
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private dateFilter: ng.IFilterDate) {
        }

        link: ng.IDirectiveLinkFn = (scope: IDateFromToScope,
            elements: ng.IAugmentedJQuery,
            attrs: IDateFromToAttributes,
            ngModelCtrl: ng.INgModelController) => {
            var self = this;
            
            var dateTimeFrom = new Date();
            var dateTimeTo = new Date(dateTimeFrom.getTime());

            //for debug
            //dateTimeFrom.setMonth(dateTimeFrom.getMonth() - 1); 
            //dateTimeTo.setMonth(dateTimeTo.getMonth() + 1);


            //real life
            dateTimeFrom.setHours(dateTimeFrom.getHours() - 24);
            dateTimeTo.setHours(dateTimeTo.getHours() + AppStaff.AppStaffConfig.lookAheadHours);

            if (scope.showFullDays) {
                dateTimeFrom.setHours(0, 0, 0);
                dateTimeTo.setHours(23, 59, 0);
            }

            scope.objFromDateTime = dateTimeFrom;//.toISOString(); //this.dateFilter(dateTimeFrom, AppCommon.AppCommonConfig.isoDateTimeFormat);
            scope.objToDateTime = dateTimeTo;//.toISOString(); //this.dateFilter(dateTimeTo, AppCommon.AppCommonConfig.isoDateTimeFormat);

            scope.fromDateTime = scope.objFromDateTime.toISOString();
            scope.toDateTime = scope.objToDateTime.toISOString();

            scope.onChangeFromDate = (): void => {
                scope.fromDateTime = scope.objFromDateTime.toISOString();
            }
            scope.onChangeToDate = (): void => {
                scope.toDateTime = scope.objToDateTime.toISOString();
            }
        }
    }

    angular.module("app.common")
        .directive("dateFromTo",
        [
            "$window", "$timeout", "SessionService", "dateFilter",
            (w, t, s, d) => new DateFromToDirective(w, t, s, d)
        ]);
}