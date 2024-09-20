module AppCommon {
    export abstract class ControllerBase {
        loadingPromise: ng.IPromise<any>;
        cgBusyConfiguration: any;
        formMessages: any;
        userInfo: UserInfo;

        accessLevel: AccessLevel;
        hasEditAccess: boolean;

        static $inject = ["AuthService"];

        constructor(authService: AuthService) {
            this.cgBusyConfiguration = { promise: this.loadingPromise, message: "Loading Your Data" };
            this.formMessages = FormMessages;

            this.userInfo = authService.getSession();
        }
    }
}