module AppCommon {
    export interface IDisplayPointsHistoryAttrs extends ng.IAttributes {
        reservationId: string; // must be lowercase "d" so html attribute will be reservation-id
    }

    export interface IDisplayPointsHistoryScope extends AppCommon.IDirectiveBaseScope {
        reservationId: string;
        pointsAccountingHistory: Array<PointsAccountingDTOExtended>;
    }

    class DisplayPointsHistoryDirective extends AppCommon.DirectiveBase {
        restrict = "E";
        templateUrl = "/appCommon/directives/customer/reward/displayPointsHistory.directive.html";
        scope = {
            reservationId: "="
        };

        static $inject = ["SessionService", "PointsAccountingRepository"];

        constructor(private sessionService: AppCommon.SessionService, private pointsAccountingRepository: AppCommon.PointsAccountingRepository) {
            super();
        }

        link: ng.IDirectiveLinkFn = (scope: IDisplayPointsHistoryScope, elements: ng.IAugmentedJQuery, attrs: IDisplayPointsHistoryAttrs) => {
            var self = this;
            this.initializeScope(scope);

            var unbindWatch: () => void;
            var getpointsAccountingHistory: () => void;

            scope.pointsAccountingHistory = new Array<PointsAccountingDTOExtended>();

            getpointsAccountingHistory = () => {
                if (scope.reservationId != null) {
                    unbindWatch();
                    scope.loadingPromise = this.pointsAccountingRepository.getByReservationID(scope.reservationId);
                    scope.loadingPromise.then((data) => {
                        scope.pointsAccountingHistory = data;
                    });
                }
            };
            unbindWatch = scope.$watch(
                () => {
                    return ((scope.reservationId === null)
                        ? -1
                        : scope.reservationId.length);
                },
                () => {
                    getpointsAccountingHistory();
                },
                true);
        };
    }

    angular.module("app.common")
        .directive("displayPointsHistory",
        [
            "SessionService", "PointsAccountingRepository",
            (sessionService, paRepo) => new DisplayPointsHistoryDirective(sessionService, paRepo)
        ]);

}