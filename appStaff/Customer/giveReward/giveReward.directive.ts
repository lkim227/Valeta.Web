module AppStaff {

    export interface IGiveRewardAttrs extends ng.IAttributes {
        canAdd: string;
    }

    export interface IGiveRewardScope extends ng.IScope {
        canAdd: boolean;
        formMessages: any;

        formIsDisabled: boolean;
        customFormIsDisabled: boolean;

        selectedCustomer: AccountDTO;
        customerAccounts: Array<AccountDTO>;
        customManagementReward: RewardDTO;
        managemntReward: RewardDTO;
        activeRewards: Array<RewardDTO>;

        availablePoints: number;
        customerPoints: Array<PointsAccountingDTO>;
        pointsToAdd: PointsAccountingDTO;

        initializeFormData(): void;
        addReward(): void;
        resetUserInputData(): void;
        selectedUserChanged(): void;
        selectedRewardChanged(): void;
    }

    class GiveRewardDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.giveRewardTemplateUrl;
        scope = {
        
        };

        static $inject = ["dateFilter", "SessionService", "AccountRepository", "RewardRepository", "PointsAccountingRepository"];

        constructor(
            private dateFilter: ng.IFilterDate,
            private sessionService: AppCommon.SessionService,
            private accountRepository: AppCommon.AccountRepository,
            private rewardRepository: AppCommon.RewardRepository,
            private pointsAccountingRepository: AppCommon.PointsAccountingRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IGiveRewardScope, elements: ng.IAugmentedJQuery, attrs: IGiveRewardAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;
            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canAdd = getBooleanAttribute(attrs.canAdd);

            scope.initializeFormData = (): void => {
                scope.formIsDisabled = true;
                scope.resetUserInputData();

                self.rewardRepository.getManagementReward(AppConfig.APIHOST)
                    .then((data) => {
                        scope.managemntReward = data;
                    });

                self.accountRepository.fetchAll(AppConfig.APIHOST)
                    .then((data) => {
                        scope.customerAccounts = data;
                        scope.customerAccounts.sort(function (a, b) {
                            return a.ContactInformation.Name.Last.localeCompare(b.ContactInformation.Name.Last);
                        });
                    });
            };

            scope.resetUserInputData = (): void => {
                scope.customManagementReward = new RewardDTO();
                scope.customManagementReward.QuantityAvailable = 1;
                scope.customManagementReward.Points = 0;

                scope.pointsToAdd = new PointsAccountingDTO();
                scope.pointsToAdd.AccountID = null;
                scope.pointsToAdd.Points = 0;
                scope.pointsToAdd.OfficeNote = null;
                scope.pointsToAdd.NoteToCustomer = null;
                scope.pointsToAdd.RewardQuantity = 1;
            };
            scope.selectedUserChanged = (): void => {
                self.accountRepository.getByID(scope.selectedCustomer.ID, AppConfig.APIHOST)
                    .then((customer) => {

                        self.pointsAccountingRepository.getSummaryByAccountID(scope.selectedCustomer.ID)
                            .then((data) => {
                                scope.formMessages = null;
                                scope.formIsDisabled = false;
                                scope.resetUserInputData();
                                scope.pointsToAdd.OfficeNote = customer.ContactInformation.MailingAddress.FriendlyName;

                                var pointsTotal = data;
                                scope.availablePoints = pointsTotal[0] + pointsTotal[1];
                            });
                    });
            };
            scope.addReward = (): void => {
                scope.formIsDisabled = true;
                scope.pointsToAdd.ID = AppCommon.GuidService.NewGuid();
                scope.pointsToAdd.AccountID = scope.selectedCustomer.ID;
                scope.pointsToAdd.CreatedBy = self.sessionService.userInfo.employeeFriendlyID;
                scope.pointsToAdd.RewardID = scope.managemntReward.ID;
                scope.pointsToAdd.Points = -(scope.customManagementReward.Points);
                scope.pointsToAdd.Status = PointsAccountingStatus.Pending;
                scope.pointsToAdd.NoteToCustomer = scope.customManagementReward.Name + " - " + scope.pointsToAdd.NoteToCustomer;

                self.pointsAccountingRepository.insert(scope.pointsToAdd, AppConfig.APIHOST)
                    .then(() => {
                        scope.formMessages = scope.customManagementReward.Name + " is successfully added to " + scope.selectedCustomer.FriendlyName;
                        scope.resetUserInputData();
                        scope.formIsDisabled = false;
                        scope.selectedCustomer = null;
                        scope.availablePoints = null;
                    });
            };

            scope.initializeFormData();
        };
    }

    angular.module("app.staff")
        .directive("giveReward",
        ["dateFilter", "SessionService", "AccountRepository", "RewardRepository", "PointsAccountingRepository",
            (d, s, a, r, p) => new GiveRewardDirective(d, s, a, r, p)]);
}