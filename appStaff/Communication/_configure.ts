module AppStaff {
    export class ConfigureRoutesForCommunicationContext {

        static $inject = ["$stateProvider", "$urlRouterProvider"];
        
        static sendMessageControllerTemplateUrl = "/appStaff/Communication/sendMessage.html";
        static sendMessageUrlSuffix = "/send-message";

        static adHocSmsTemplateUrl = "/appStaff/Communication/adHocSms.directive.html";
        static smsCommunicationTemplateUrl = "/appStaff/Communication/smsCommunication.directive.html";


        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state("send-message",
                {
                    url: ConfigureRoutesForCommunicationContext.sendMessageUrlSuffix + "/:referenceContext/:identifier/:mobilePhone/:customerName",
                    params: {
                        referenceContext: null,
                        identifier: null,
                        mobilePhone: null,
                        customerName: null
                    },
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: ConfigureRoutesForCommunicationContext.sendMessageControllerTemplateUrl
                        }
                    },
                    data: {
                        PageTitle: "Send message",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.employees, AppCommon.AuthService.RIGHTS.dispatch]
                    }
                });
        }
    }

    angular.module("app.staff")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureRoutesForCommunicationContext($stateProvider, $urlRouterProvider)
        ]);

}