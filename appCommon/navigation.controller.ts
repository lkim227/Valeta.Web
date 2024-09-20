module AppCommon {

    export class NavigationController {

        private myName: string;
        private myUsername: string;
        private myPicture: string;

        static $inject = ["$state", "AuthService", "ProfileImageService", "SessionService"];
        
        constructor(
            private $state: ng.ui.IStateService,
            private authService: AuthService,
            private profileImageService: AppCommon.ProfileImageService,
            private sessionService: SessionService) {
            //this.isServiceDepartment = authService.isAuthorized(AuthService.USER_ROLES.serviceDepartment);
            if (sessionService.userInfo.userRoles[0] === AuthService.USER_ROLES.employee) {
                this.myName = sessionService.userInfo.employeeFriendlyID;
                this.profileImageService.getProfileImageUrl(UserType.Employee, sessionService.userInfo.employeeID)
                    .then((url: string) => {
                        if (!!url) {
                            this.myPicture = url;
                        }
                    });
            } else {
                this.myName = sessionService.userInfo.customerFriendlyID;
                this.profileImageService.getProfileImageUrl(UserType.Customer, sessionService.userInfo.customerAccountID)
                    .then((url: string) => {
                        if (!!url) {
                            this.myPicture = url;
                        }
                    });
            }
            this.myUsername = sessionService.userInfo.userName;

            this.showFindValet();
            this.showDispatch();
            this.showServiceFulfillment();
            this.showIssues();
            this.showCustomers();
            this.showEmployees();
            this.showSystemSetup();
            this.showMarketing();
            this.showSecurity();
        }

        navigateTo(page: string): void {
            this.$state.go(page);
        }
        

        canShowFindValet: boolean;         //here for faster processing (numerous ng digests can re-run the show() methods)
        showFindValet(): boolean {
            this.canShowFindValet = this.authService.getMyAccessLevel(AuthService.RIGHTS.findValet) >= AccessLevel.View;
            return this.canShowFindValet;
        }

        canShowDispatch: boolean;
        showDispatch(): boolean {
            this.canShowDispatch = this.authService.getMyAccessLevel(AuthService.RIGHTS.dispatch) >= AccessLevel.View;
            return this.canShowDispatch;
        }

        canShowServiceFulfillment: boolean;        
        showServiceFulfillment(): boolean {
            this.canShowServiceFulfillment = this.authService.getMyAccessLevel(AuthService.RIGHTS.serviceFulfillment) >= AccessLevel.View;
            return this.canShowServiceFulfillment;
        }

        canShowIssues: boolean;
        showIssues(): boolean {
            this.canShowIssues = this.authService.getMyAccessLevel(AuthService.RIGHTS.issues) >= AccessLevel.View;
            return this.canShowIssues;
        }

        canShowCustomers: boolean;
        showCustomers(): boolean {
            this.canShowCustomers = this.authService.getMyAccessLevel(AuthService.RIGHTS.customers) >= AccessLevel.View;
            return this.canShowCustomers;
        }

        canShowEmployees: boolean;
        showEmployees(): boolean {
            this.canShowEmployees = this.authService.getMyAccessLevel(AuthService.RIGHTS.employees) >= AccessLevel.View;
            return this.canShowEmployees;
        }

        canShowSystemSetup: boolean;
        showSystemSetup(): boolean {
            this.canShowSystemSetup = this.authService.getMyAccessLevel(AuthService.RIGHTS.systemSetup) >= AccessLevel.View;
            return this.canShowSystemSetup;
        }

        canShowMarketing: boolean;
        showMarketing(): boolean {
            this.canShowMarketing = this.authService.getMyAccessLevel(AuthService.RIGHTS.marketing) >= AccessLevel.View;
            return this.canShowMarketing;
        }

        canShowSecurity: boolean;
        showSecurity(): boolean {
            this.canShowSecurity = this.authService.getMyAccessLevel(AuthService.RIGHTS.security) >= AccessLevel.View;
            return this.canShowSecurity;
        }
    }

    angular.module("app.common")
        .controller("NavigationController",
        [
            "$state", "AuthService", "ProfileImageService", "SessionService",
            (state, auth, profile, s) => new NavigationController(state, auth, profile, s)
        ]);
}