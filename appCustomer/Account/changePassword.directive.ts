module AppCustomer {
    import AuthService = AppCommon.AuthService;

    export interface IChangePasswordScope extends ng.IScope {
        oldPassword: string;
        newPassword: string;
        confirmPassword: string;

        passwordMatched: boolean;
        passwordChangedSuccessfully: boolean;

        initializeRestng(authorizationHeader: string): void;

        changePassword(): void;
        formMessages: any;
    }

    class ChangePasswordDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appCustomer/Account/changePassword.directive.html";
        scope = {
            order: "="
        };

        static $inject = ["Restangular", "ErrorHandlingService", "SessionService", "AuthService"];

        constructor(private restng: restangular.IService,
                    private errorHandlingService: AppCommon.ErrorHandlingService,
                    private sessionService: AppCommon.SessionService,
                    private authService: AppCommon.AuthService
        ) {}

        link: ng.IDirectiveLinkFn = (scope: IChangePasswordScope, elements: ng.IAugmentedJQuery) => {
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

            scope.changePassword = () => {
                self.authService.changeAccountPassword(self.sessionService.userInfo.customerAccountID, scope.oldPassword, scope.newPassword)
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


    angular.module("app.customer")
        .directive("changePassword",
        [
            "Restangular", "ErrorHandlingService", "SessionService", "AuthService",
            (rest, err, ss, auth) => new ChangePasswordDirective(rest, err, ss, auth)
        ]);
}