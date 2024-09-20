module AppStaff {

    export interface IAccountNoteAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IAccountNoteScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        accountIdentifier: string;
        textData: string;
    }

    class AccountNoteDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appStaff/Ticket/accountNote.directive.html";
        scope = {
            accountIdentifier: "="
        };

        static $inject = ["$timeout", "SessionService", "AccountRepository"];

        constructor(
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private accountRepository: AppCommon.AccountRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IAccountNoteScope, elements: ng.IAugmentedJQuery, attrs: IAccountNoteAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;

            var initializeDirective = () => {
                this.accountRepository.getByID(scope.accountIdentifier, AppConfig.APIHOST)
                    .then((data) => {
                    if (data) {
                        scope.textData = data.OfficeNote;
                    }
                });;

                scope.directiveInitialized = true;
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("accountIdentifier",
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

    angular.module("app.staff")
        .directive("accountNote",
        [
            "$timeout", "SessionService", "AccountRepository",
            (t, s, a) => new AccountNoteDirective(t, s, a)
        ]);
}