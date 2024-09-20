module AppStaff {
    
    export interface IEmployeeAdminAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IEmployeeAdminScope extends AppCommon.IDirectiveBaseScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        accessLevel: AccessLevel;
        hasEditAccess: boolean;
        editType: string;

        hasSecurityAccess: boolean;
        showArchived: boolean;
        profileImageUrls: string[];

        formMessages: any;

        employeeModal: any;
        addNewEmployee(): void;
        openAddEmployee(): void;
        cancelAddEmployee(): void;
        resetNewEmployeeData(): void;
        archiveEmployee(dataItem: any, isArchived: boolean): void;
        archivedFlagChanged(): void;
        resetPassword(dataItem: any): void;

        dataSourceStateDefinedList: kendo.data.DataSource;
        gridOptions: any;

        newEmployee: EmployeeDTO;
        newEmployeePassword: string;
        newEmployeeErrorMessage: string;
    }

    class EmployeeAdminDirective extends AppCommon.DirectiveBase {
        restrict = "E";
        templateUrl = AppStaffConfig.employeeAdminTemplateUrl;
        scope = {

        };

        static $inject = ["SessionService", "EmployeeRepository", "AuthService", "ProfileImageService", "ValetServiceCommand", "$uibModal"];

        constructor(
            private sessionService: AppCommon.SessionService,
            private employeeRepository: AppCommon.EmployeeRepository,
            private authService: AppCommon.AuthService,
            private profileImageService: AppCommon.ProfileImageService,
            private valetServiceCommand: AppCommon.ValetServiceCommand,
            private $uibModal) {

            super();
        }

        link: ng.IDirectiveLinkFn = (scope: IEmployeeAdminScope, elements: ng.IAugmentedJQuery, attrs: IEmployeeAdminAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            this.initializeScope(scope);

            scope.formMessages = AppCommon.FormMessages;
            scope.newEmployeeErrorMessage = null;
            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.employees);
            scope.hasEditAccess = scope.accessLevel >= AccessLevel.Edit;

            scope.canCreate = getBooleanAttribute(attrs.canCreate) && scope.hasEditAccess;
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate) && scope.hasEditAccess;
            scope.canDelete = getBooleanAttribute(attrs.canDelete);

            if (scope.canUpdate && scope.hasEditAccess) {
                scope.editType = "incell";
            }
            else {
                scope.editType = "false";
            }

            scope.hasSecurityAccess = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.security) >= AccessLevel.View;

            scope.showArchived = false;
            scope.profileImageUrls = [];

            //build datasource
            var schema = {
                model: {
                    id: "ID",
                    fields: {
                        "ContactInformation.Email.EmailAddress": { editable: false }, //apply complex child type options this way
                        "ProfileImage": { editable: false },

                        ID: { type: "string", editable: false, nullable: true },
                        ContactInformation: {
                            fields: {
                                Name: {
                                    fields: {
                                        First: { validation: { required: true } },
                                        Last: { validation: { required: true } }
                                    }
                                },
                                MobilePhone: {
                                    fields: {
                                        Number: { validation: { required: true } }
                                    }
                                },
                                MailingAddress: {
                                    fields: {
                                        Line1: {},
                                        Line2: {},
                                        City: {},
                                        State: {},
                                        PostalCode: {}
                                    }
                                },
                                Email: {
                                    fields: {
                                        EmailAddress: { validation: { required: true } }
                                    }
                                }
                            }
                        },
                        PrimaryRoleID: { editable: false },
                        Password: { validation: { required: true } },
                        ValetAppPinCode: { validation: { required: true } },
                        Badge: {}
                    }
                }
            };

            var dataSource: kendo.data.DataSource;

            var getProfileImageUrls = () => {
                var dataSourceData = dataSource.data();
                var profileImageReferences = [];
                for (let i = 0; i < dataSourceData.length; i++) {
                    var profileImageReference = new ProfileImageReferenceDTO();
                    profileImageReference.UserType = UserType.Employee;
                    profileImageReference.ID = dataSourceData[i].ID;
                    profileImageReferences.push(profileImageReference);
                }
                this.profileImageService.getProfileImageUrls(profileImageReferences)
                    .then((ref: ProfileImageReferenceDTO[]) => {
                        if (!!ref) {
                            scope.$evalAsync(() => {
                                ref.forEach((x) => scope.profileImageUrls[x.ID] = x.Url);
                                }
                            );
                        }
                    });
            }

            dataSource = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: AppConfig.APIHOST + "Employee/GetAll",
                        type: "get",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                        },
                        complete: () => {
                            getProfileImageUrls();
                        }
                    },
                    update: {
                        url: AppConfig.APIHOST + "Employee/UpdateAndQuery",
                        type: "post",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                        }
                    },
                    create: {
                        url: AppConfig.APIHOST + "Employee/CreateAndQuery",
                        type: "post",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                        }
                    },
                    destroy: {
                        url: options => (AppConfig.APIHOST + "Employee/Delete/" + options.ID),
                        type: "delete",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                        }
                    }
                },
                autoSync: false,
                batch: false,
                schema: schema
            });
            dataSource.sort([
                { field: "ContactInformation.Name.Last", dir: "asc" },
                { field: "ContactInformation.Name.First", dir: "asc" }
            ]);

            scope.newEmployee = new EmployeeDTO();
            scope.newEmployee.ContactInformation = new ContactInformationDTO();
            scope.newEmployee.ContactInformation.Name = new NameDTO();
            scope.newEmployee.ContactInformation.MobilePhone = new PhoneNumberDTO();
            scope.newEmployee.ContactInformation.MailingAddress = new AddressDTO();
            scope.newEmployee.ContactInformation.Email = new EmailDTO();
            scope.newEmployee.ContactInformation.MorePhones = null;

            scope.addNewEmployee = () => {
                dataSource.add(scope.newEmployee);

                scope.loadingPromise = this.employeeRepository.insert(scope.newEmployee, AppConfig.APIHOST);
                scope.loadingPromise.then((success) => {
                    if (success) {
                        scope.cancelAddEmployee();
                        dataSource.read();
                    }
                    else {
                        scope.newEmployeeErrorMessage = "An error ocurred to create account. Probably the information you provided already exists in our system.";
                    }
                });
            };

            scope.openAddEmployee = () => {
                scope.newEmployeeErrorMessage = null;
                scope.employeeModal = this.$uibModal.open({
                    templateUrl: 'addEmployeeModalContent',
                    size: 'md',
                    scope: scope
                });
            };

            scope.cancelAddEmployee = () => {
                scope.resetNewEmployeeData();
                scope.employeeModal.close();
            };

            scope.resetNewEmployeeData = () => {
                scope.newEmployee = new EmployeeDTO();
                scope.newEmployee.ContactInformation = new ContactInformationDTO();
                scope.newEmployee.ContactInformation.Name = new NameDTO();
                scope.newEmployee.ContactInformation.MobilePhone = new PhoneNumberDTO();
                scope.newEmployee.ContactInformation.MailingAddress = new AddressDTO();
                scope.newEmployee.ContactInformation.Email = new EmailDTO();
                scope.newEmployee.ContactInformation.MorePhones = null;
            };

            scope.archivedFlagChanged = () => {
                scope.showArchived = !scope.showArchived;
                var urlString = AppConfig.APIHOST + "Employee/GetAll";

                if (scope.showArchived) {
                    urlString = AppConfig.APIHOST + "Employee/GetAllArchived";
                }

                //rebuild datasource
                dataSource.options.transport.read.url = urlString;
                dataSource.read();
            };

            scope.archiveEmployee = (dataItem: any, archive: boolean) => {              
                if (archive) {
                    var response = confirm("Are you sure you want to deactivate " + dataItem.ContactInformation.Name.FriendlyName + "?");
                    if (response === false) {
                        return;
                    }
                    dataSource.remove(dataItem); // destroy 
                    dataSource.sync();
                } else {
                    var response = confirm("Are you sure you want to restore " + dataItem.ContactInformation.Name.FriendlyName + "?");
                    if (response === false) {
                        return;
                    }
                    dataItem.set("IsArchived", archive);
                    dataSource.sync().then(() => dataSource.read()); // restored item will still be in data set until data is re-read
                }
            };

            scope.resetPassword = (dataItem: any) => {
                var response = confirm("Are you sure you want to reset password for " + dataItem.ContactInformation.Name.FriendlyName + "?");
                if (response === false) {
                    return;
                }
                scope.loadingPromise = this.authService.resetPassword(dataItem.ContactInformation.Email.EmailAddress);
                scope.loadingPromise.then(() => {
                        confirm("Password was reset. Email was sent to " + dataItem.ContactInformation.Email.EmailAddress);
                    });
            };
            
            //get states
            scope.dataSourceStateDefinedList = AppCommon.KendoFunctions.getDefinedListAsKendoDataSource("State");
            var definedListStates = (container, options) => {
                $('<input id="categorySelector" data-bind="value : ContactInformation.MailingAddress.State"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        dataSource: scope.dataSourceStateDefinedList,
                        dataTextField: "Description",
                        dataValueField: "Value",
                        valuePrimitive: true
                    });
            };

            //textarea editors
            var addressLine1Editor = (container, options) => {
                $('<textarea class="k-textbox" rows="5" name="' + options.field + '" data-bind="value : ContactInformation.MailingAddress.Line1"/>')
                    .appendTo(container);
            };
            var emailEditor = (container, options) => {
                $('<textarea class="k-textbox" rows="5" name="' + options.field + '" data-bind="value : ContactInformation.Email.EmailAddress"/>')
                    .appendTo(container);
            };

            //build grid
            var filterable = "true";
            var columns = [
                {
                    field: "ID", 
                    hidden: true
                },
                {
                    field: "ProfileImage",
                    title: "Profile",
                    template:`<div>
                                    <div class="employee-img-preview">
                                        <a href="{{profileImageUrls[\'#=ID#\']}}" target="_blank">
                                            <img class="img-responsive" alt="Profile Image" ng-src="{{profileImageUrls[\'#=ID#\']}}" on-error-src="/appCommon/resources/profile-icon.png"/>
                                        </a>
                                        <label for="employeeProfileImage_#=ID#">change</label>
                                        <input type="file" accept="image/*" class="employee-img-input" name="profileImage" profile-image-input="file" profile-image-preview="filepreview" profile-type="employee_#=ID#" id="employeeProfileImage_#=ID#" />
                                    </div>
                                </div>`,
                    filterable: false,
                    editable: false
                },
                {
                    field: "ContactInformation.Name.First",
                    title: "First Name",
                    editable: false,
                    filterable: {
                        cell: {
                            operator: "contains",
                            showOperators: false
                        }
                    }
                },
                {
                    field: "ContactInformation.Name.Last",
                    title: "Last Name",
                    filterable: {
                        cell: {
                            operator: "contains",
                            showOperators: false
                        }
                    }
                },
                {
                    field: "ContactInformation.MobilePhone.Number",
                    title: "Mobile",
                    template: "<div class='nowrap'>{{ dataItem.ContactInformation.MobilePhone.Number| tel }}</div>",
                    filterable: false
                },
                {
                    field: "ValetAppPinCode",
                    title: "PIN Code",
                    filterable: false
                },
                {
                    field: "Badge",
                    title: "Badge",
                    filterable: false
                },
                {
                    field: "ContactInformation.MailingAddress.Line1",
                    title: "Address Line 1",
                    width: "100px", editor: addressLine1Editor,
                    template: "#= (!!ContactInformation.MailingAddress && !!ContactInformation.MailingAddress.Line1) ? ContactInformation.MailingAddress.Line1 : ' ' #",
                    filterable: false
                },
                {
                    field: "ContactInformation.MailingAddress.Line2",
                    title: "Line 2",
                    template: "#= (!!ContactInformation.MailingAddress && !!ContactInformation.MailingAddress.Line2) ? ContactInformation.MailingAddress.Line2 : ' ' #",
                    filterable: false
                },
                {
                    field: "ContactInformation.MailingAddress.City",
                    title: "City",
                    template: "#= (!!ContactInformation.MailingAddress && !!ContactInformation.MailingAddress.City) ? ContactInformation.MailingAddress.City : ' ' #",
                    filterable: false
                },
                {
                    field: "ContactInformation.MailingAddress.State",
                    title: "State",
                    template: "#= (!!ContactInformation.MailingAddress && !!ContactInformation.MailingAddress.State) ? ContactInformation.MailingAddress.State : ' ' #",
                    width: "80px",
                    editor: definedListStates,
                    filterable: false
                },
                {
                    field: "ContactInformation.MailingAddress.PostalCode",
                    title: "Zip",
                    template: "#= (!!ContactInformation.MailingAddress && !!ContactInformation.MailingAddress.PostalCode) ? ContactInformation.MailingAddress.PostalCode : ' ' #",
                    width: "60px",
                    filterable: false
                },
                {
                    field: "ContactInformation.Email.EmailAddress",
                    title: "Email",
                    template: "#= (!!ContactInformation.Email) ? ContactInformation.Email.EmailAddress : ' ' #",
                    filterable: false
                },
                {
                    field: "PrimaryRoleID",
                    title: "Role ID",
                    hidden: true,
                    filterable: false
                },
                {
                    title: "",
                    template: '<a class="link" href="/appStaff/\\#/set-userroles/#=ID#/#=ContactInformation.Name.First# #=ContactInformation.Name.Last#">Roles</a><br/>',
                    hidden: !scope.hasSecurityAccess,
                    filterable: false
                },
                {   // Note that restored item will be in data set until data is re-read
                    title: "Actions",
                    template: `<div ng-show="hasEditAccess === true">
                                <button class="btn btn-default" ng-click="resetPassword(dataItem, true)">
                                    Reset Password
                                </button>
                                <button class="btn btn-default" ng-show="showArchived === false && dataItem.IsArchived === false" 
                                        ng-click="archiveEmployee(dataItem, true)">
                                    <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                    Deactivate
                                </button>
                                <button class="btn btn-default" ng-show="dataItem.IsArchived === true" 
                                        ng-click="archiveEmployee(dataItem, false)">
                                    <span class="glyphicon glyphicon-repeat" aria-hidden="true"></span>
                                    Restore
                                </button>
                                <debug-employee-commands employee="dataItem" show-archived="$parent.showArchived"></debug-employee-commands>
                               </div>`,
                    width: "150px",
                    editable: false,
                    filterable: false,
                    hidden: !scope.hasEditAccess
                }
            ];

            scope.gridOptions = AppCommon.KendoFunctions.getGridOptions(
                dataSource,
                "Employee",
                false, //add is handle via special window
                scope.canUpdate && scope.hasEditAccess,
                filterable,
                columns, null,
                scope.editType
            );
        };
    }

    angular.module("app.staff")
        .directive("employeeAdmin",
        ["SessionService", "EmployeeRepository", "AuthService", "ProfileImageService", "ValetServiceCommand", "$uibModal",
            (s, ep, a, p, vs, $uibModal) => new EmployeeAdminDirective(s, ep, a, p, vs, $uibModal)]);
}