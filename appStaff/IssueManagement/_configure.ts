module AppStaff {
    export class ConfigureForIMContext {

        static issuesTemplateUrl = "IssueManagement/issues.directive.html";
        static singleIssueControllerTemplateUrl = "/appStaff/IssueManagement/singleIssue.html";
        static singleIssueDisplayUrlSuffix = "/issue";

        static communicationContext = "Issue";


        static $inject = ["$stateProvider", "$urlRouterProvider"];

        constructor(private $stateProvider: ng.ui.IStateProvider, private $urlRouterProvider: ng.ui.IUrlRouterProvider) {

            this.$stateProvider.state("issues",
            {
                url: "/issues",
                views: {
                    "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                    "navigation": AppStaffConfig.staffNavigationView,
                    "": {
                        templateUrl: "/appStaff/IssueManagement/issues.html"
                    }
                },
                data: {
                    PageTitle: "Issues",
                    authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                    rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.issues]
                }
            });

            this.$stateProvider.state("issue",
                {
                    url: ConfigureForIMContext.singleIssueDisplayUrlSuffix + "/:issueID",
                    params: {
                        issueID: null
                    },
                    views: {
                        "formPageHeader": AppCommon.AppCommonConfig.formPageHeaderState,
                        "navigation": AppStaffConfig.staffNavigationView,
                        "": {
                            templateUrl: ConfigureForIMContext.singleIssueControllerTemplateUrl
                        }
                    },
                    data: {
                        PageTitle: "Issue",
                        authorizedRoles: [AppCommon.AuthService.USER_ROLES.employee],
                        rightsThatHaveAccess: [AppCommon.AuthService.RIGHTS.issues]
                    }
                });
        }
    }

    angular.module("app.staff")
        .config([
            "$stateProvider", "$urlRouterProvider",
            ($stateProvider, $urlRouterProvider) => new ConfigureForIMContext($stateProvider, $urlRouterProvider)
        ]);

}