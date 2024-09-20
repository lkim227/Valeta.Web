module AppCommon {
    export interface IPointSummaryAttrs extends ng.IAttributes {
        showAvailableOnly: boolean;
    }

    export interface IPointSummaryScope extends ng.IScope {
        accountID: string;
        earnedPoints: number;
        redemedPoints: number;
        availablePoints: number;
        showAvailableOnly: boolean;

        analyticsEventName: string;

        pointsTotal: any[];
    }

    class PointSummaryDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.pointSummaryTemplateUrl;
        scope = {
        
        };

        static $inject = ["$stateParams", "SessionService", "PointsAccountingRepository"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private pointsAccountingRepository: AppCommon.PointsAccountingRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IPointSummaryScope, elements: ng.IAugmentedJQuery, attrs: IPointSummaryAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;

            if (_.includes(self.sessionService.userInfo.userRoles, "Employee")) {
                // probably is some staff user
                scope.accountID = self.$stateParams["customerIdentifier"];
            }
            else {
                // otherwise is customer logged on account
                scope.accountID = self.sessionService.userInfo.customerAccountID;
            }

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.showAvailableOnly = getBooleanAttribute(attrs.showAvailableOnly);

            self.pointsAccountingRepository.getSummaryByAccountID(self.sessionService.userInfo.customerAccountID)
                .then((data) => {
                    scope.pointsTotal = data;
                    scope.earnedPoints = scope.pointsTotal[0];
                    scope.redemedPoints = -scope.pointsTotal[1];
                    scope.availablePoints = scope.pointsTotal[0] + scope.pointsTotal[1];
                });
        };
    }


    angular.module("app.common")
        .directive("pointSummary",
        ["$stateParams", "SessionService", "PointsAccountingRepository", (sp, ss, pointsAccountingRepo) => new PointSummaryDirective(sp, ss, pointsAccountingRepo)]);
}