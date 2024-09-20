module AppStaff {
    export interface ISetUserRolesAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface ISetUserRolesScope extends ng.IScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        accessLevel: AccessLevel;
        hasEditAccess: boolean;
        createdBy: string;

        userIDParam: string;
        userNameParam: string;

        roles: UserRoleDTO[];
        save(): void;
        cancel(): void;
    }

    class SetUserRolesDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = ConfigureForSecurityContext.securitySetUserRolesTemplateUrl;

        static $inject = ["$state", "$stateParams", "SessionService", "AuthService", "UserRoleRepository"];

        constructor(
            private $state: any,
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private userRoleRepository: AppCommon.UserRoleRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: ISetUserRolesScope, elements: ng.IAugmentedJQuery, attrs: ISetUserRolesAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;

            scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.security);
            scope.hasEditAccess = scope.accessLevel >= AccessLevel.Edit;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canCreate = getBooleanAttribute(attrs.canCreate) && scope.hasEditAccess;
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate) && scope.hasEditAccess;
            scope.canDelete = getBooleanAttribute(attrs.canDelete) && scope.hasEditAccess;
            scope.createdBy = self.sessionService.userInfo.employeeFriendlyID;

            scope.userIDParam = this.$stateParams["userId"];
            scope.userNameParam = this.$stateParams["userName"];

            self.userRoleRepository.fetch(scope.userIDParam, AppConfig.APIHOST).then((data) => {
                scope.roles = data;
            });            
            
            scope.save = () => {
                self.userRoleRepository.updateUserRoles(scope.userIDParam, scope.roles, AppConfig.APIHOST);
                self.$state.go("employee-admin");
            };
            scope.cancel = () => {
                self.$state.go("employee-admin");
            }
        }
    }

    angular.module("app.staff")
        .directive("setUserRoles",
        [
            "$state", "$stateParams", "SessionService", "AuthService", "UserRoleRepository",
            (state, sp, ss, auth, r) => new SetUserRolesDirective(state, sp, ss, auth, r)
        ]);
}