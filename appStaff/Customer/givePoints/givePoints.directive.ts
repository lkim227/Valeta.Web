module AppStaff {

    export interface IGivePointsAttrs extends ng.IAttributes {
        canAdd: string;
    }

    export interface IGivePointsScope extends ng.IScope {
        canAdd: boolean;
        formMessages: any;

        formIsDisabled: boolean;
        selectedCustomer: AccountDTO;
        customerAccounts: Array<AccountDTO>;
        givePoints: Array<PointsAccountingDTO>;
        pointsToAdd: PointsAccountingDTO;
        initializeFormData(): void;
        clearPointsToAdd(): void;
        addPoints(): void;
        getPointsDataForSelectedCustomer(): void;
        resetUserInputData(): void;
        selectedUserChanged(): void;
    }

    class GivePointsDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.givePointsTemplateUrl;
        scope = {

        };

        static $inject = ["dateFilter", "SessionService", "SystemConfigurationService", "AccountRepository", "PointsAccountingRepository"];

        constructor(
            private dateFilter: ng.IFilterDate,
            private sessionService: AppCommon.SessionService,
            private systemConfigurationService: AppCommon.SystemConfigurationService,
            private accountRepository: AppCommon.AccountRepository,
            private PointsAccountingRepository: AppCommon.PointsAccountingRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IGivePointsScope, elements: ng.IAugmentedJQuery, attrs: IGivePointsAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;
            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canAdd = getBooleanAttribute(attrs.canAdd);

            scope.initializeFormData = (): void => {
                scope.formIsDisabled = true;
                scope.resetUserInputData();

                self.accountRepository.fetchAll(AppConfig.APIHOST)
                    .then((data) => {
                        scope.customerAccounts = data;
                        scope.customerAccounts.sort(function (a, b) {
                            return a.ContactInformation.Name.Last.localeCompare(b.ContactInformation.Name.Last);
                        });
                    });
            };

            scope.resetUserInputData = (): void => {
                scope.pointsToAdd = new PointsAccountingDTO();
                scope.pointsToAdd.AccountID = null;
                scope.pointsToAdd.Points = null;
                scope.pointsToAdd.OfficeNote = null;
                scope.pointsToAdd.NoteToCustomer = null;
            };
            scope.selectedUserChanged = (): void => {
                scope.formMessages = null;
                scope.formIsDisabled = false;
                scope.resetUserInputData();
            };
            scope.addPoints = (): void => {
                scope.formIsDisabled = true;
                scope.pointsToAdd.ID = AppCommon.GuidService.NewGuid();
                scope.pointsToAdd.AccountID = scope.selectedCustomer.ID;
                scope.pointsToAdd.CreatedBy = self.sessionService.userInfo.employeeFriendlyID;
                scope.pointsToAdd.Status = PointsAccountingStatus.Completed;
                self.PointsAccountingRepository.insert(scope.pointsToAdd, AppConfig.APIHOST)
                    .then(() => {
                        self.PointsAccountingRepository.changeRewardStatus(scope.pointsToAdd.ID, "completed", self.sessionService.userInfo.employeeFriendlyID)
                            .then((success) => {
                                if (success) {
                                }
                            });

                        scope.formMessages = scope.pointsToAdd.Points + " point" + (scope.pointsToAdd.Points === 1 ? "" : "s") + " successfully added to " + scope.selectedCustomer.FriendlyName;
                        scope.resetUserInputData();
                        scope.formIsDisabled = false;
                    });
            };

            scope.initializeFormData();
        };
    }

    angular.module("app.staff")
        .directive("givePoints",
        ["dateFilter", "SessionService", "SystemConfigurationService", "AccountRepository", "PointsAccountingRepository", (df, s, c, a, p) => new GivePointsDirective(df, s, c, a, p)]);
}