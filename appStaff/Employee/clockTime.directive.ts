module AppStaff {
    export interface IClockTimeAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IClockTimeScope extends ng.IScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        createdBy: string;

        loadingPromise: ng.IPromise<any>;
        cgBusyConfiguration: any; 

        isShiftInProgress: boolean;
        shiftStartDateTime: number;
        totalHoursMinutesMessage: string;
        checkTimesheet(): void;
        startClock(): void;
        endClock(): void;
        formMessages: any;
    }

    class ClockTimeDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "Employee/clockTime.directive.html";
        scope = {
        
        };

        static $inject = ["SessionService", "ValetServiceCommand", "TimesheetQueryRepository"];

        constructor(private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand,
            private timesheetQueryRepository: TimesheetQueryRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IClockTimeScope, elements: ng.IAugmentedJQuery, attrs: IClockTimeAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;
            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canCreate = getBooleanAttribute(attrs.canCreate);
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate);
            scope.canDelete = getBooleanAttribute(attrs.canDelete);
            scope.createdBy = self.sessionService.userInfo.employeeFriendlyID;
            scope.isShiftInProgress = false;


            scope.checkTimesheet = () => {
                scope.loadingPromise = self.timesheetQueryRepository.getByEmployeeIDCurrentShift(this.sessionService.userInfo.employeeID);
                scope.loadingPromise.then((data) => {
                    if (!!data && !!data.ID) {
                        scope.isShiftInProgress = true;
                        scope.shiftStartDateTime = data.StartDateTimestamp;
                        scope.totalHoursMinutesMessage = data.TotalHoursMinutesMessage;
                    }
                });
            };

            scope.startClock = () => {
                var command = new StartShiftCommandDTO();
                command.ID = this.sessionService.userInfo.employeeID;
                command.CreatedBy = this.sessionService.userInfo.employeeID;
                scope.loadingPromise = self.valetServiceCommand.doCommand(ValetConfiguration_Routing.ValetCommandRoute, command)
                scope.loadingPromise.then(() => {
                        scope.checkTimesheet();
                    });
            };

            scope.endClock = () => {
                var commandEndShift = new EndShiftCommandDTO();
                commandEndShift.ID = this.sessionService.userInfo.employeeID;
                commandEndShift.CreatedBy = this.sessionService.userInfo.employeeID;
                scope.loadingPromise = self.valetServiceCommand.doCommand(ValetConfiguration_Routing.ValetCommandRoute, commandEndShift)
                scope.loadingPromise.then(() => {
                        scope.isShiftInProgress = false;
                    });
            };

            // init
            scope.checkTimesheet();
        };

    }

    angular.module("app.staff")
        .directive("clockTime",
        ["SessionService", "ValetServiceCommand", "TimesheetQueryRepository", (s, v, t) => new ClockTimeDirective(s, v, t)]);
}