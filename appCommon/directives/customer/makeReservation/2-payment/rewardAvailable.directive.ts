module AppCommon {
    export interface IRewardAvailableScope extends ng.IScope {
        accountID: string;
        reservedRewards: any[]; // ReservedRewardDTO
        availableRewards: any[];

        availablePoints: number;
        remainingPoints: number;
        redeemedPoints: number;
        rewardsInitialized: boolean;

        enumUtils: AppCommon.EnumUtils;

        analyticsEventName: string;

        selectionChanged(reward: any): void;
        quantityChanged(reward: any): void;
        resetCartOfRewards(): void;
    }

    class RewardAvailableDirective implements ng.IDirective {
        templateUrl = AppCommonConfig.rewardAvailableTemplateUrl;
        scope = {
            analyticsEventName: "@",
            reservedRewards: "="
        };

        static $inject = ["$window", "$state", "$stateParams", "SessionService", "KendoDataSourceService", "PointsAccountingRepository"];

        constructor(private $window: Window,
            private $state: ng.ui.IStateService,
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private kendoDataSourceService: AppCommon.KendoDataSourceService,
            private pointsAccountingRepository: AppCommon.PointsAccountingRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IRewardAvailableScope, elements: ng.IAugmentedJQuery, attrs: AppCommon.IListViewDirectiveBaseAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.enumUtils = AppCommon.EnumUtils;
            scope.rewardsInitialized = false;
            scope.availableRewards = [];
            if (!scope.reservedRewards) scope.reservedRewards = [];

            if (_.includes(self.sessionService.userInfo.userRoles, "Employee")) {
                // probably is some staff user
                scope.accountID = self.$stateParams["customerIdentifier"];
            }
            else {
                // otherwise is customer logged on account
                scope.accountID = self.sessionService.userInfo.customerAccountID;
            }
            
            var calculateCartPoints = () => {
                scope.redeemedPoints = scope.reservedRewards
                    .reduce((total, reservedReward) => {
                        total += (reservedReward.Points * (reservedReward.QuantityReserved || 0));
                        return total;
                    }, 0);
                scope.remainingPoints = scope.availablePoints - scope.redeemedPoints;
            }

            var addToCart = (availableReward: any) => {
                if (availableReward.QuantityReserved <= 0) {
                    $(`#${availableReward.ID}`).prop("checked", false);
                    return;
                }
                var reserverdReward = angular.copy(availableReward);
                delete reserverdReward.userSelectedThis; // remove attribute needed for ui
                scope.reservedRewards.push(reserverdReward);
                calculateCartPoints();
            }

            var removeFromCart = (availableReward: any) => {
                var reservedIndex = IESafeUtils.arrayFindIndex(scope.reservedRewards, x => x.ID === availableReward.ID, this);
                if (reservedIndex >= 0) {
                    scope.reservedRewards.splice(reservedIndex, 1);
                }
                calculateCartPoints();
            }

            scope.quantityChanged = (availableReward: any) => {
                // make calculations simple by removing reward from cart if it is there
                removeFromCart(availableReward);

                // normalize updated quantity reserved
                if (!AppCommon.RewardUtils.isPositiveFiniteNumber(availableReward.QuantityReserved)) {
                    availableReward.QuantityReserved = 1;
                } else {
                    availableReward.QuantityReserved = Math.floor(availableReward.QuantityReserved);
                }

                var max = AppCommon.RewardUtils.maxCanReserve(availableReward, scope.remainingPoints);
                if (availableReward.QuantityReserved > max) {
                    availableReward.QuantityReserved = max;
                }

                addToCart(availableReward);
            }

            scope.selectionChanged = (availableReward: any) => {
                if (availableReward.userSelectedThis) {
                        availableReward.QuantityReserved = 1;
                        scope.quantityChanged(availableReward);
                }
                else
                {
                    availableReward.QuantityReserved = 0;
                    removeFromCart(availableReward);
                }
            }

            scope.resetCartOfRewards = () => {
                if (!!scope.availableRewards) {
                    scope.availableRewards.forEach((x) => {
                        x.QuantityReserved = 0;
                        x.userSelectedThis = false;
                        removeFromCart(x);
                    });
                }
            }

            // 
            // Initialize data model
            // 

            var availableRewardsDataSource = self.kendoDataSourceService.getDataSource(CommonConfiguration_Routing.RewardRoute, CommonConfiguration_Routing_RewardMethods.GetAvailable, "");
            availableRewardsDataSource.fetch(() => {
                scope.availableRewards = availableRewardsDataSource.data().toJSON();

                self.pointsAccountingRepository.getSummaryByAccountID(scope.accountID)
                    .then((data) => {
                        // summary data
                        var pointSummary = data;
                        scope.availablePoints = AppCommon.RewardUtils.isFiniteNumber(pointSummary[0]) && AppCommon.RewardUtils.isFiniteNumber(pointSummary[1])
                            ? pointSummary[0] + pointSummary[1]
                            : 0;

                        // prune and initialize available rewards (in reverse, in case any need to be removed)
                        scope.availableRewards = scope.availableRewards
                            .filter(x => !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.ID));
                        for (let i = scope.availableRewards.length - 1; i >= 0; i--) {
                            if (scope.availableRewards.filter(x => x.ID === scope.availableRewards[i].ID).length > 1 // duplicate
                                || !AppCommon.RewardUtils.isNonNegativeFiniteNumber(scope.availableRewards[i].Points) // unknown cost
                                || (scope.availableRewards[i].AppliesTo === RewardAppliesTo.Gift && !AppCommon.RewardUtils.isPositiveFiniteNumber(scope.availableRewards[i].QuantityAvailable)) // none to redeem, if gift item
                                || scope.availablePoints < scope.availableRewards[i].Points // can't redeem even one
                            ) {
                                // prune
                                scope.availableRewards.splice(i, 1);
                                continue;
                            }

                            // initialize
                            scope.availableRewards[i].QuantityReserved = 0;
                            scope.availableRewards[i].userSelectedThis = false;
                        }

                        // prune cart of reserved rewards and update matching available rewards 
                        // (in reverse, in case items need to be removed)
                        scope.reservedRewards = scope.reservedRewards
                            .filter(x => !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(x.ID));
                        for (let i = scope.reservedRewards.length - 1; i >= 0; i--) {
                            let matchingAvailable = scope.availableRewards.filter(x => x.ID === scope.reservedRewards[i].ID);
                            if (scope.reservedRewards.filter(x => x.ID === scope.reservedRewards[i].ID).length > 1 // duplicate
                                || matchingAvailable.length !== 1 // not available
                                || !AppCommon.RewardUtils.isPositiveFiniteNumber(scope.reservedRewards[i].QuantityReserved) // none or indeterminite number reserved
                            ) {
                                // prune
                                scope.reservedRewards.splice(i, 1);
                                continue;
                            }

                            // update matching available reward
                            matchingAvailable[0].QuantityReserved = scope.reservedRewards[i].QuantityReserved;
                        }

                        // refresh/validate cart (it's possible the user has fewer points or the rewards cost 
                        // more than when they were initially reserved)
                        calculateCartPoints();
                        scope.availableRewards.forEach(x => {
                            if (x.QuantityReserved > 0) {
                                scope.quantityChanged(x);
                            }
                        });

                        // now that cart is clean, update selections
                        scope.availableRewards.forEach(x => x.userSelectedThis = x.QuantityReserved > 0);

                        scope.rewardsInitialized = true;
                    });
            });
        };
    }

    angular.module("app.common")
        .directive("rewardAvailable",
        [
            "$window", "$state", "$stateParams", "SessionService", "KendoDataSourceService", "PointsAccountingRepository",
            (win, state, sparams, ss, kendoDs, paRepo) => new RewardAvailableDirective(win, state, sparams, ss, kendoDs, paRepo)
        ]);
}