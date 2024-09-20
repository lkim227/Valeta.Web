module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface IMeetLocationUpdateOfficeAttributes extends ng.IAttributes {
        canUpdate: string;
        reloadOnSave: string;
    }

    export interface IMeetLocationUpdateOfficeScope extends ng.IScope {
        directiveInitialized: boolean;
        ticketIdentifier: string;
        isTicketActive: boolean;
        textData: string;
        travelDirection: TravelDirection;

        utils: AppCommon.GenericUtils; // for html calls

        meetLocationLabel: string;

        canUpdate: boolean;
        isInEditMode: boolean;

        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class MeetLocationUpdateOfficeDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appStaff/Ticket/meetLocationUpdateOffice.directive.html";
        scope = {
            ticketIdentifier: "=",
            isTicketActive: "=",
            textData: "=",
            travelDirection: "="
        };

        static $inject = ["$state", "$timeout", "SessionService", "ValetServiceCommand"];

        constructor(
            private $state: ng.ui.IStateService, 
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: IMeetLocationUpdateOfficeScope, elements: ng.IAugmentedJQuery, attrs: IMeetLocationUpdateOfficeAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;

            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && scope.isTicketActive;
            scope.isInEditMode = false;

            if (scope.travelDirection === TravelDirection.FromCustomer) {
                scope.meetLocationLabel = AppCommon.FlightUtils.flightDirectionToString(FlightDirection.Departure);
            } else if (scope.travelDirection === TravelDirection.ToCustomer) {
                scope.meetLocationLabel = AppCommon.FlightUtils.flightDirectionToString(FlightDirection.Return);
            } else {
                scope.meetLocationLabel = "";
            }

            var createdBy = this.sessionService.userInfo.employeeFriendlyID;
            var textDataCopy: string;

            var backupTextData = (): void => {
                textDataCopy = utils.cloneObject(scope.textData);
            }
            var restoreTextData = (): void => {
                scope.textData = utils.cloneObject(textDataCopy);
            }
            scope.onEdit = (): void => {
                backupTextData();
                scope.isInEditMode = true;
            }
            scope.onUpdate = (): void => {
                scope.canUpdate = false;
                scope.isInEditMode = false;
                
                var command: any;
                if (scope.travelDirection === TravelDirection.FromCustomer) {
                    command = new ChangeIntakeRelativeMeetLocationCommandDTO();
                } else {
                    //is not programmed in the backend
                    //command = new ChangeGiveBackRelativeMeetLocationCommandDTO();
                }

                command.ID = scope.ticketIdentifier;
                command.CreatedBy = createdBy;
                command.IntakeRelativeMeetLocation = scope.textData;
                self.valetServiceCommand.doCommand("AirportTicketCommand", command)
                    .then((data) => {
                        if (!data) {
                            restoreTextData();
                        }
                        scope.canUpdate = true;                     
                    });
            }
            scope.onCancel = (): void => {
                restoreTextData();
                scope.isInEditMode = false;
            }
            var initializeDirective = () => {


                scope.directiveInitialized = true;
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("textData",
                    (newValue) => {
                        if (typeof (newValue) !== "undefined") {
                            deregisterWait();
                            initializeDirective();
                        }
                    });;
            }
            var waitForDom = () => {
                waitForScopeVariables();
            }
            setTimeout(waitForDom, 0);
        }
    }

    angular.module("app.common")
        .directive("meetLocationUpdateOffice",
        [
            "$state", "$timeout", "SessionService", "ValetServiceCommand",
            (s, t, ss, v) => new MeetLocationUpdateOfficeDirective(s, t, ss, v)
        ]);
}