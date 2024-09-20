module AppCommon {
    export class AuthService extends RestClientBase {

        static USER_ROLES = {
            all: "*",
            employee: "Employee",
            customer: "Customer",
            anonymous: "Anonymous"
        };

        //add a new right here, and directly into security database
        static RIGHTS = {
            customers: "Customers",
            dispatch: "Dispatch",
            employees: "Employees",
            financialData: "Financial Data",
            findValet: "Find Valet",
            issues: "Issues",
            security: "Security",
            serviceFulfillment: "Service Fulfillment",
            systemSetup: "System Setup",
            marketing: "Marketing"
        }

        static $inject = ["Restangular", "ErrorHandlingService", "SessionService"];

        constructor(restng: restangular.IService,
            errorHandlingService: ErrorHandlingService,
            private sessionService: SessionService) {

            super(restng, errorHandlingService);
        }

        login(loginCredential: LoginCredential, rememberMe: boolean): ng.IPromise<UserInfo> {
            return this.restng
                .all("account/token")
                .post(`grant_type=password&username=${loginCredential.Username}&password=${loginCredential.Password}`,
                    undefined,
                    {
                        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                    })
                .then(data => {
                    var finalResult = this.restng.stripRestangular(data);
                    this.sessionService.create(data.plain(), rememberMe);
                    return finalResult;
                })
                .catch((failReason) => {
                    var errorToShowUser = !!failReason.data.error_description
                        ? failReason.data.error_description
                        : "There is a problem with your login.  Please try again or contact support.";
                    this.errorHandlingService.showPageError(errorToShowUser, "form-errorBoxAbsolute");
                    return null;
                });
        }


        isAuthenticated(): boolean {
            return !!this.sessionService.userInfo;
        };

        hasAtLeastOneOfTheseRights(rights: string[], minimumAccessLevel: AccessLevel): boolean {
            if (!rights || rights.length === 0) return true;      //if rights not specified

            for (var i = 0; i < rights.length; i++) {
                var right = rights[i];
                var level = this.getMyAccessLevel(right);
                if (level >= minimumAccessLevel) {
                    return true;
                }
            }
            return false;
        }

        isAuthorized(authorizedRoles): boolean {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            if (!this.isAuthenticated()) {
                return false;
            }
            if (authorizedRoles.indexOf("*") !== -1) {
                return true;
            }
            for (let i = 0; i < this.sessionService.userInfo.userRoles.length; i++) {
                if (authorizedRoles.indexOf(this.sessionService.userInfo.userRoles[i]) !== -1) {
                    return true;
                }
            }
            return false;
        };

        getMyAccessLevel(rightName: string): AccessLevel {
            var right = IESafeUtils.arrayFind(this.sessionService.userInfo.UserRights, r => r.RightName === rightName, this);
            return !!right ? right.AccessLevel : AccessLevel.None;
        }
        
        logout() {
            this.sessionService.destroy();
        };

        getSession(): UserInfo {
            if (!this.sessionService.userInfo) {
                this.sessionService.create(null, true);
            }
            return this.sessionService.userInfo;
        };

        changeAccountPassword(accountId: string, oldPassword: string, newPassword: string): ng.IPromise<boolean> {
            var path = CommonConfiguration_Routing.ChangePasswordRoute + "/" +
                CommonConfiguration_Routing_ChangePasswordMethods.Customer +
                `?accountID=${accountId}&oldPassword=${oldPassword}&newPassword=${newPassword}`;

            return this.restng
                .all(path)
                .post("", undefined,
                {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                })
                .then(() => {
                    return true; //success
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There was a problem changing your password.");
                    return null;
                });
        };
        
        changeStaffPassword(employeeId: string, oldPassword: string, newPassword: string): ng.IPromise<boolean> {
            var path = CommonConfiguration_Routing.ChangePasswordRoute + "/" +
                CommonConfiguration_Routing_ChangePasswordMethods.Staff +
                `?employeeID=${employeeId}&oldPassword=${oldPassword}&newPassword=${newPassword}`;

            return this.restng
                .all(path)
                .post("", undefined,
                    {
                        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                    })
                .then(() => {
                    return true; //success
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There was a problem changing your password.");
                    return null;
                });
        };

        createPassword(accountId: string, password: string, legacyUserName: string): ng.IPromise<boolean> {
            return this.restng
                .all(`Account/CreatePassword?accountID=${accountId}&password=${password}&legacyUserName=${legacyUserName}`)
                .post("", undefined,
                {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                })
                .then(() => {
                    return true; //success
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There was a problem creating your password.");
                    return null;
                });
        };

        resetPassword(email: string): ng.IPromise<boolean> {
            var path = CommonConfiguration_Routing.ResetPasswordRoute +
                `?email=${email}`;

            return this.restng
                .all(path)
                .post("", undefined,
                {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                })
                .then((data) => {
                    return true; //success
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There is a problem with your account.");
                    return false;
                });
        }

        resetPasswordTo(email: string, newPassword: string): ng.IPromise<boolean> {
            var path = CommonConfiguration_Routing.ResetPasswordRoute + "/" +
                CommonConfiguration_Routing_ResetPasswordMethods.ResetPasswordTo +
                `?email=${email}&newPassword=${newPassword}`;

            return this.restng
                .all(path)
                .post("", undefined,
                    {
                        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                    })
                .then((successResult: boolean) => {
                    return successResult; 
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There is a problem with your account.");
                    return false;
                });
        }
    }

    angular.module("app.common")
        .service("AuthService",
        [
            "Restangular", "ErrorHandlingService", "SessionService",
            (rest, err, ss) => new AuthService(rest, err, ss)
        ]);
}