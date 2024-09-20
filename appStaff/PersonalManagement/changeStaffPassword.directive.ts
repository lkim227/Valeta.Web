module AppCustomer {
    import AuthService = AppCommon.AuthService;

    export interface IChangeStaffPasswordScope extends ng.IScope {
        oldPassword: string;
        newPassword: string;
        confirmPassword: string;

        passwordMatched: boolean;
        passwordChangedSuccessfully: boolean;

        initializeRestng(authorizationHeader: string): void;

        changeStaffPassword(): void;
        formMessages: any;
    }

    class ChangeStaffPasswordDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appStaff/PersonalManagement/changeStaffPassword.directive.html";
        scope = {
            order: "="
        };

        static $inject = ["Restangular", "ErrorHandlingService", "SessionService", "AuthService"];

        constructor(private restng: restangular.IService,
                    private errorHandlingService: AppCommon.ErrorHandlingService,
                    private sessionService: AppCommon.SessionService,
                    private authService: AppCommon.AuthService
        ) {}

        link: ng.IDirectiveLinkFn = (scope: IChangeStaffPasswordScope, elements: ng.IAugmentedJQuery) => {
            var self = this;

            scope.formMessages = AppCommon.FormMessages;
            scope.passwordMatched = false;

            scope.$watch("confirmPassword",
                () => {
                    if (!!scope.confirmPassword) {
                        // validate passwords match
                        if (scope.confirmPassword === scope.newPassword)
                            scope.passwordMatched = true;
                        else
                            scope.passwordMatched = false;
                    }
                },
                true);

            scope.changeStaffPassword = () => {
                self.authService.changeStaffPassword(self.sessionService.userInfo.employeeID, scope.oldPassword, scope.newPassword)
                    .then(() => {
                        scope.passwordChangedSuccessfully = true;
                    });
            };

            scope.initializeRestng = (authorizationHeader: string): void => {
                var iscope: any = this;
                this.restng.setBaseUrl(AppConfig.APIHOST);
                this.restng.setDefaultHeaders({
                    "Content-Type": "application/json;charset=UTF-8",
                    "Authorization": authorizationHeader
                });

                if (iscope.key) {
                    this[iscope.key] = [];
                }

                if (iscope.key && iscope.model) {
                    // Extend any objects sourced from Local Storage
                    angular.forEach(iscope[iscope.key],
                        function(obj) {
                            angular.extend(obj, iscope.model);
                        });
                }
            };

            scope.initializeRestng(`Bearer ${this.sessionService.userInfo.access_token}`);
        };
    }


    angular.module("app.staff")
        .directive("changeStaffPassword",
        [
            "Restangular", "ErrorHandlingService", "SessionService", "AuthService",
            (rest, err, ss, auth) => new ChangeStaffPasswordDirective(rest, err, ss, auth)
        ]);
}