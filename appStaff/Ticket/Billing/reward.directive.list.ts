module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface IRewardListScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        isTicketActive: boolean;
        rewards: ReservedRewardDTO[];
        createdBy: string;
        
        utils: AppCommon.GenericUtils; // for html calls

        onDelete(item: ReservedRewardDTO): void;
    }

    class RewardListDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appStaff/Ticket/Billing/reward.directive.list.html";
        scope = {
            ticketIdentifier: "=",
            isTicketActive: "=",
            rewards: "="
        };

        static $inject = ["$state", "SessionService", "AuthService", "BillingCommand"];

        constructor(
            private $state: ng.ui.IStateService, 
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private billingCommand: AppCommon.BillingCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: IRewardListScope) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;

            //todo: fix, but for now we don't need this functionality yet
            scope.onDelete = (item: ReservedRewardDTO): void => {
            //    var response = confirm("Are you sure you want to delete " + item.Description + " reward?");
            //    if (response === false) {
            //        return;
            //    }

            //    var command = new DeleteReservedRewardCommandDTO();
            //    command.ID = scope.ticketIdentifier;
            //    command.CreatedBy = scope.createdBy;
            //    command.Reward = item;

            //    self.billingCommand.doCommand(command)
            //        .then(() => {
            //            this.$state.reload();
            //        });
            }
         
            var initializeDirective = () => {
                scope.directiveInitialized = true;
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("rewards",
                    (newValue) => {
                        if (typeof (newValue) !== "undefined") {
                            deregisterWait();
                            initializeDirective();
                        }
                    });;
            }
            var waitForDom = () => {
                waitForScopeVariables();
            }
            setTimeout(waitForDom, 0);
        }
    }

    angular.module("app.staff")
        .directive("rewardList",
        [
            "$state", "SessionService", "AuthService", "BillingCommand",
            (t, s, auth, bc) => new RewardListDirective(t, s, auth, bc)
        ]);
}