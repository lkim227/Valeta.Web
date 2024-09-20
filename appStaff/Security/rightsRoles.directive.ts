module AppStaff {
    export interface IRightsRolesAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IRightsRolesScope extends ng.IScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        accessLevel: AccessLevel;
        hasEditAccess: boolean;
        createdBy: string;

        roles: Array<string>;
        selectedRole: string;
        selectedRoleIsEditable: boolean;
        rolename: string;
        roleChanged(): void;
        accessLevelList: kendo.data.DataSource;
        gridOptions: any;

        addEditRoleModal: any;
        saveRole(): void;
        openNewRole(): void;
        cancelNewRole(): void;
        addNewRoleForm: ng.IFormController;
        role: any;

        editRoleModal: any;
        openEditRole(): void;
        cancelEditRole(): void;
        editRoleWindow: kendo.ui.Window;
        editRoleForm: ng.IFormController;

        deleteRole(): void;
        openDeleteRole(): void;
        cancelDeleteRole(): void;
        deleteRoleWindow: kendo.ui.Window;
        deleteRoleForm: ng.IFormController;
    }

    class RightsRolesDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaff.ConfigureForSecurityContext.securityRightsRolesTemplateUrl;

        static $inject = ["$stateParams", "SessionService", "AuthService", "RolesRepository", "RightsRolesRepository", "$uibModal"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private rolesRepository: AppCommon.RolesRepository,
            private rightsRolesRepository: AppCommon.RightsRolesRepository,
            private $uibModal) {
        }

        link: ng.IDirectiveLinkFn = (scope: IRightsRolesScope, elements: ng.IAugmentedJQuery, attrs: IRightsRolesAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;

            scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.security);
            scope.hasEditAccess = scope.accessLevel >= AccessLevel.Edit;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canCreate = getBooleanAttribute(attrs.canCreate) && scope.hasEditAccess;
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate) && scope.hasEditAccess;
            scope.canDelete = getBooleanAttribute(attrs.canDelete) && scope.hasEditAccess;
            scope.createdBy = self.sessionService.userInfo.employeeFriendlyID;

            self.rolesRepository.fetchAll(AppConfig.APIHOST).then((data: string[]) => {
                scope.roles = data;
            });

            //build datasource
            var schema = {
                model: {
                    id: "ID",
                    fields: {
                        ID: { editable: false },
                        AccessLevel: { validation: { required: true } },
                        RightName: { editable: false }
                    }
                }
            };
            var readCommand = {
                url: AppConfig.APIHOST + "RightsRoles/" + scope.selectedRole,
                type: "get",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                }
            };
            var updateCommand = {
                url: AppConfig.APIHOST + "RightsRoles",
                type: "put",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                }
            };

            var changeHandler = (e: any) => {
                scope.selectedRoleIsEditable = false; // there are some Roles that cannot be edited or deleted
                var data = e.sender.data().toJSON().find((role: RightsRolesDTO) => {
                    return role.IsEditable;
                });
                if (!!data) {
                    scope.selectedRoleIsEditable = data;
                }
            };

            var dataSource = AppCommon.KendoDataSourceFactory.createKendoDataSource("RightsRoles", schema, null, readCommand, updateCommand, null, null, null, changeHandler);
            dataSource.sort([
                { field: "RightName", dir: "asc" }
            ]);


            //get status enum as a list
            scope.accessLevelList = AppCommon.KendoFunctions.getEnumAsKendoDataSource(AccessLevel, [AccessLevel.Superuser]);
            var accessLevelOptions =
                "<input k-on-change=\"dataItem.dirty=true\" kendo-drop-down-list k-data-text-field=\x22'Description'\x22 k-data-value-field=\x22'Value'\x22  k-data-source=\"accessLevelList\" k-value-primitive=\"true\" k-ng-model=\"dataItem.AccessLevel\" name=\"AccessLevel\"/>";

            //build grid
            var filterable = "true";
            var columns = [
                { field: "ID", hidden: true },
                { field: "RightName", title: "Right", filterable: false },
                { //view-only AccessLevel, don't use AccessLevel as a field, b/c that's editable
                    field: "RightName",
                    title: "Access Level",
                    template:
                    "#= AppCommon.GenericUtils.camelToTitle(AppCommon.EnumUtils.getNameForValueAccessLevel(AccessLevel)) #",
                    width: "120px",
                    hidden: scope.canUpdate
                },
                { //edit field
                    field: "AccessLevel",
                    title: "Access Level",
                    editor: accessLevelOptions,
                    template:
                    "#= AppCommon.GenericUtils.camelToTitle(AppCommon.EnumUtils.getNameForValueAccessLevel(AccessLevel)) #",
                    width: "120px",
                    hidden: !scope.canUpdate
                }
            ];
            scope.gridOptions = AppCommon.KendoFunctions.getGridOptions(
                dataSource,
                "RightsRoles",
                false,
                scope.canUpdate,
                filterable,
                columns);
            scope.role = {
                title: '',
                modal: null,
                isEdit: false
            };


            scope.roleChanged = () => {
                if (!!scope.selectedRole) {
                    //rebuild datasource
                    var urlString = AppConfig.APIHOST + "RightsRoles/" + scope.selectedRole;

                    var grid: any = $("#gridRightsRoles").data("kendoGrid");
                    grid.dataSource.transport.options.read.url = urlString; 
                    grid.dataSource.read();
                }
            };

            //adding new role
            scope.saveRole = () => {
                if (scope.role.isEdit) {
                    saveEditRole();
                } else {
                    addNewRole();
                }
            };

            function addNewRole() {
                if (!!scope.role.title && scope.role.title.length > 0) {
                    if (scope.roles.indexOf(scope.role.title) < 0) {
                        scope.selectedRole = scope.role.title;

                        var jsonNewRole = "\"" + scope.role.title + "\"";
                        self.rolesRepository.insert(jsonNewRole, AppConfig.APIHOST).then(() => {
                            self.rolesRepository.fetchAll(AppConfig.APIHOST).then((data) => {
                                scope.roles = data;
                            });
                            scope.roleChanged();
                        });
                    }
                }
                scope.cancelNewRole();
            };
            scope.openNewRole = () => {
                scope.role.modal = this.$uibModal.open({
                    templateUrl: 'addEditRoleModalContent',
                    size: 'md',
                    scope: scope
                });
                scope.role.isEdit = false;
            };
            scope.cancelNewRole = () => {
                scope.role.title = null;
                scope.role.modal.close();
            };

            //edit role
            function saveEditRole() {
                if (!!scope.role.title && scope.role.title.length > 0 && scope.role.title.trim() !== scope.selectedRole.trim()) {
                    if (scope.roles.indexOf(scope.role.title) < 0) {
                        var oldRole = scope.selectedRole;
                        var newRole = scope.role.title;

                        self.rolesRepository.updateRole(oldRole, newRole, AppConfig.APIHOST)
                            .then(() => {
                                self.rolesRepository.fetchAll(AppConfig.APIHOST).then((data) => {
                                    scope.roles = data;
                                    scope.selectedRole = newRole;
                                    scope.roleChanged();
                                });
                            });
                    }
                }
                scope.cancelEditRole();
            };
            scope.openEditRole = () => {
                scope.role.title = scope.selectedRole;
                scope.role.modal = this.$uibModal.open({
                    templateUrl: 'addEditRoleModalContent',
                    size: 'md',
                    scope: scope
                });
                scope.role.isEdit = true;
            };
            scope.cancelEditRole = () => {
                scope.role.title = '';
                scope.role.modal.close();
                scope.role.isEdit = false;
            };

            //delete role
            scope.deleteRole = () => {
                if (!!scope.role.title) {
                    self.rolesRepository.delete(scope.role.title, AppConfig.APIHOST)
                        .then(() => {
                            scope.selectedRole = null;

                            self.rolesRepository.fetchAll(AppConfig.APIHOST).then((data) => {
                                scope.roles = data;
                            });
                        });
                }
                scope.cancelDeleteRole();
            };

            scope.openDeleteRole = () => {
                scope.role.modal = this.$uibModal.open({
                    templateUrl: 'deleteRoleModalContent',
                    size: 'md',
                    scope: scope
                });
            };
            scope.cancelDeleteRole = () => {
                scope.role.title = '';
                scope.role.modal.close();
            };
        }
    }

    angular.module("app.staff")
        .directive("rightsRoles",
        [
            "$stateParams", "SessionService", "AuthService", "RolesRepository", "RightsRolesRepository", "$uibModal",
            (sp, s, auth, r, rr, $uibModal) => new RightsRolesDirective(sp, s, auth, r, rr, $uibModal)
        ]);
}