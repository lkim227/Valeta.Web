module AppStaff {
    import AngularStatic = angular.IAngularStatic;
    import ErrorHandlingService = AppCommon.ErrorHandlingService;

    export interface IDebugEmployeeCommandsAttrs extends ng.IAttributes {
    }
    export interface IDebugEmployeeCommandsScope extends ng.IScope {
        employee: EmployeeDTO;
        showArchived: boolean;
        accessLevel: AccessLevel;
        hasEditAccess: boolean;
        debugEnvironment: boolean;
        preferredRole: Role;

        valetLoginGreeter(): void;
        valetLoginEither(): void;
        valetLoginRunner(): void;
        requestShiftEnd(): void;
    }

    class DebugEmployeeCommandsDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.debugEmployeeCommandsTemplateUrl;
        scope = {
            employee: "=",
            showArchived: "="
        };

        static $inject = ["Restangular", "AuthService", "SessionService", "ValetServiceCommand"];

        constructor(
            private restng: restangular.IService,
            private authService: AppCommon.AuthService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: IDebugEmployeeCommandsScope, elements: ng.IAugmentedJQuery, attrs: IDebugEmployeeCommandsAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;

            scope.debugEnvironment = AppConfig.APIHOST === "http://api.valeta.local/";

            scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.employees);
            scope.hasEditAccess = scope.accessLevel >= AccessLevel.Edit;

            var valetLogin = (preferredRole: Role) => {
                if (!scope.debugEnvironment || !scope.hasEditAccess || scope.employee.IsArchived) {
                    console.log("Invalid invocation");
                    return;
                }
                var command = new ValetLogInDTO();
                command.GeoLocation = new GeoLocation();
                command.GeoLocation.Latitude = 33.0123252;
                command.GeoLocation.Longitude = -96.6852504;
                command.OperatingLocationID = "00000000-0000-0000-0000-000000000dfa";
                command.Pin = scope.employee.ValetAppPinCode;
                command.PreferredRole = Role[preferredRole];
                command.DeviceCode = Math.random().toString().substr(2, 3);
                command.PushNotificationRegistrationToken = Math.random().toString();
                this.restng
                    .one("ValetLogIn/LogIn")
                    .customPOST(command)
                    .then(() => {
                        console.log(`${scope.employee.FriendlyID} Preferred Role: ${command.PreferredRole} ValetLogIn: Success`);
                    })
                    .catch((failReason) => {
                        console.log(`${scope.employee.FriendlyID} Preferred Role: ${command.PreferredRole} ValetLogIn: ERROR`);
                    });
            }

            scope.valetLoginGreeter = () => valetLogin(Role.Greeter);
            scope.valetLoginEither = () => valetLogin(Role.Either);
            scope.valetLoginRunner = () => valetLogin(Role.Runner);

            scope.requestShiftEnd = () => {
                if (!scope.debugEnvironment || !scope.hasEditAccess || scope.employee.IsArchived) {
                    console.log("Invalid invocation");
                    return;
                }
                var command = new RequestEndShiftCommandDTO();
                command.ID = scope.employee.ID;
                command.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;
                self.valetServiceCommand.doCommand(ValetConfiguration_Routing.ValetCommandRoute, command)
                    .then((success) => {
                        console.log(scope.employee.FriendlyID + " RequestEndShift: " + (success ? "Success" : "ERROR"));
                    });
            }
    };
}

angular.module("app.staff")
    .directive("debugEmployeeCommands",
    ["Restangular", "AuthService", "SessionService", "ValetServiceCommand", (r, a, s, v) => new DebugEmployeeCommandsDirective(r, a, s, v)]);
}