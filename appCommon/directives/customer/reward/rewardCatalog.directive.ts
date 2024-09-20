module AppCommon {

    export interface IRewardCatalogScope extends ng.IScope {
        accountID: string;
        availableRewards: any[];
        availablePoints: number;
        pointBalance: number;
        pointSummary: number[];
        pointsSpentOnOrder: number;
        orderMessage: string;

        rewardAppliesToGiftEnumValue: RewardAppliesTo;

        analyticsEventName: string;

        //dataSource: kendo.data.DataSource;

        updateOrderQty(reward: number): void;
        updateOrderCalculations(): void;
        showCatalogActionForReward(reward: number): boolean;
        showRewardInCatalog(reward: number): boolean;
        addRewardToCart(reward: number): void;
        removeRewardFromCart(reward: number): void;
        placeOrder(): void;
        goToReservation(): void;
    }

    class RewardCatalogDirective implements ng.IDirective {
        templateUrl = AppCommonConfig.rewardCatalogTemplateUrl;
        scope = {
            analyticsEventName: "@",
            reservedRewards: "=?"
        };

        static $inject = ["$window", "$state", "$stateParams", "SessionService", "KendoDataSourceService", "PointsAccountingRepository"];

        constructor(private $window: Window,
            private $state: ng.ui.IStateService,
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private kendoDataSourceService: AppCommon.KendoDataSourceService,
            private pointsAccountingRepository: AppCommon.PointsAccountingRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IRewardCatalogScope, elements: ng.IAugmentedJQuery, attrs: AppCommon.IListViewDirectiveBaseAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.rewardAppliesToGiftEnumValue = RewardAppliesTo.Gift;

            if (_.includes(self.sessionService.userInfo.userRoles, "Employee")) {
                // probably is some staff user
                scope.accountID = self.$stateParams["customerIdentifier"];
            }
            else {
                // otherwise is customer logged on account
                scope.accountID = self.sessionService.userInfo.customerAccountID;
            }

            scope.availableRewards = [];
            scope.pointsSpentOnOrder = 0;
            scope.orderMessage = "Browse rewards catalog below. Items not associated with a reservation may be ordered here.";

            var dataSource = self.kendoDataSourceService.getDataSource(CommonConfiguration_Routing.RewardRoute, CommonConfiguration_Routing_RewardMethods.GetAvailable, "");
            
            var maxRewardQty = (reward: number): number => {
                var maxCanAfford = (scope.availableRewards[reward].orderQty + (Math.floor(scope.pointBalance / scope.availableRewards[reward].Points)));
                return maxCanAfford > scope.availableRewards[reward].QuantityAvailable
                    ? scope.availableRewards[reward].QuantityAvailable
                    : maxCanAfford;;
            }

            var updateOrderCalculations = () => {
                if (!!scope.availableRewards) {
                    scope.$evalAsync(() => {
                        scope.pointsSpentOnOrder = 0;

                        for (let reward = 0; reward < scope.availableRewards.length; reward++) {
                            if (scope.availableRewards[reward].inShoppingCart === true) {
                                scope.pointsSpentOnOrder += scope.availableRewards[reward].Points *
                                    scope.availableRewards[reward].orderQty;
                            }
                        }
                        scope.pointBalance = scope.availablePoints - scope.pointsSpentOnOrder;
                    });
                }
            }

            dataSource.fetch(() => {
                var activeRewards = dataSource.data().toJSON();

                self.pointsAccountingRepository.getSummaryByAccountID(scope.accountID)
                    .then((data) => {
                        scope.pointSummary = data;
                        scope.availablePoints = scope.pointSummary[0] + scope.pointSummary[1];
                        scope.pointBalance = scope.availablePoints;

                        for (let reward = 0; reward < activeRewards.length; reward++) {
                            if (activeRewards[reward].CustomerVisible === true
                                && AppCommon.RewardUtils.isPositiveFiniteNumber(activeRewards[reward].QuantityAvailable)) {

                                activeRewards[reward].inShoppingCart = false;
                                scope.availableRewards.push(activeRewards[reward]);
                            }
                        }
                    });

            });

            scope.showCatalogActionForReward = (reward: number): boolean => {
                if (scope.availableRewards[reward].AppliesTo !== scope.rewardAppliesToGiftEnumValue
                    || (!scope.availableRewards[reward].inShoppingCart && scope.availableRewards[reward].Points <= scope.pointBalance)) {

                    return true;
                }
                return false;
            };

            scope.showRewardInCatalog = (reward: number): boolean => {
                if (!scope.availableRewards[reward].inShoppingCart
                    && AppCommon.RewardUtils.isPositiveFiniteNumber(scope.availableRewards[reward].QuantityAvailable)) {

                    return true;
                }
                return false;
            };

            scope.updateOrderQty = (reward: number): void => {
                if (!AppCommon.RewardUtils.isPositiveFiniteNumber(scope.availableRewards[reward].newOrderQty)
                    || scope.availableRewards[reward].newOrderQty > maxRewardQty(reward)) {
                    scope.availableRewards[reward].newOrderQty = scope.availableRewards[reward].orderQty; // reject new quantity
                    return;
                }
                scope.availableRewards[reward].orderQty = scope.availableRewards[reward].newOrderQty; // accept new quantity
                updateOrderCalculations();
            }

            scope.addRewardToCart = (reward: number) => {
                scope.availableRewards[reward].orderQty = 0;
                scope.availableRewards[reward].newOrderQty = 1;
                scope.availableRewards[reward].inShoppingCart = true;
                scope.updateOrderQty(reward);
            }

            scope.removeRewardFromCart = (reward: number) => {
                scope.availableRewards[reward].inShoppingCart = false;
                scope.availableRewards[reward].orderQty = 0;
                updateOrderCalculations();
            }

            scope.placeOrder = () => {
                scope.pointsSpentOnOrder = 0;
                for (let reward = 0; reward < scope.availableRewards.length; reward++) {
                    if (scope.availableRewards[reward].inShoppingCart === true
                        && AppCommon.RewardUtils.isPositiveFiniteNumber(scope.availableRewards[reward].orderQty)
                        && AppCommon.RewardUtils.isPositiveFiniteNumber(scope.availableRewards[reward].QuantityAvailable)
                        && scope.availableRewards[reward].orderQty <= scope.availableRewards[reward].QuantityAvailable) {

                        const rewardOrder = scope.availableRewards[reward].Points * scope.availableRewards[reward].orderQty;
                        scope.availableRewards[reward].QuantityAvailable -= scope.availableRewards[reward].orderQty;

                        scope.pointsSpentOnOrder += rewardOrder;
                        const selectedRewards = new PointsAccountingDTO();
                        selectedRewards.ID = AppCommon.GuidService.NewGuid();
                        selectedRewards.AccountID = scope.accountID;
                        selectedRewards.Points = 0 - rewardOrder;
                        selectedRewards.RewardID = scope.availableRewards[reward].ID;
                        selectedRewards.RewardQuantity = scope.availableRewards[reward].orderQty;
                        self.pointsAccountingRepository.insert(selectedRewards, AppConfig.APIHOST);
                    }

                    //reset
                    scope.availableRewards[reward].orderQty = 0;
                    scope.availableRewards[reward].inShoppingCart = false;
                }
                scope.availablePoints -= scope.pointsSpentOnOrder;
                updateOrderCalculations();
                scope.orderMessage = "Thank you for ordering your rewards.  We will ship them shortly.";
            };

            scope.goToReservation = () => {
                this.$state.go("make-reservation");
            };
        };
    }

    angular.module("app.common")
        .directive("rewardCatalog",
        [
            "$window", "$state", "$stateParams", "SessionService", "KendoDataSourceService", "PointsAccountingRepository",
            (win, state, sparams, ss, kendoDs, paRepo) => new RewardCatalogDirective(win, state, sparams, ss, kendoDs, paRepo)
        ]);
}