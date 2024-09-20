module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface ISlotUpdateAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface ISlotUpdateScope extends ng.IScope {
        directiveInitialized: boolean;
        canUpdate: boolean;
        ticketIdentifier: string;
        isTicketActive: boolean;
        textData: string;
        ticketNumber: number;
        createdBy: string;

        utils: AppCommon.GenericUtils; // for html calls

        textDataCopy: string;
        isInEditMode: boolean;

        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
    }

    class SlotUpdateDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.slotUpdateTemplateUrl;
        scope = {
            ticketIdentifier: "=",
            isTicketActive: "=",
            textData: "=",
            ticketNumber: "="
        };

        static $inject = ["$state", "$timeout", "SessionService", "ValetServiceCommand"];

        constructor(
            private $state: ng.ui.IStateService, 
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand) {
        }

        link: ng.IDirectiveLinkFn = (scope: ISlotUpdateScope, elements: ng.IAugmentedJQuery, attrs: ISlotUpdateAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;

            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && scope.isTicketActive;
            scope.isInEditMode = false;
            scope.createdBy = this.sessionService.userInfo.employeeFriendlyID;

            var backupTextData = (): void => {
                scope.textDataCopy = utils.cloneObject(scope.textData);
            }
            var restoreTextData = (): void => {
                scope.textData = utils.cloneObject(scope.textDataCopy);
            }
            scope.onEdit = (): void => {
                backupTextData();
                scope.isInEditMode = true;
            }
            scope.onUpdate = (): void => {
                scope.canUpdate = false;
                scope.isInEditMode = false;

                var setActualSlotCommand = new SetActualSlotCommandDTO();
                setActualSlotCommand.ID = scope.ticketIdentifier;
                setActualSlotCommand.CreatedBy = scope.createdBy;
                setActualSlotCommand.TicketNumber = scope.ticketNumber;
                //todo: 
                //setActualSlotCommand.LotID =
                //setActualSlotCommand.LotName =
                setActualSlotCommand.SlotCode = scope.textData;

                var command = new SetActualSlotAndKeysLocationAtBaseCommandDTO();
                command.ID = scope.ticketIdentifier;
                command.CreatedBy = scope.createdBy;
                command.SetActualSlotCommand = setActualSlotCommand;
                command.KeysLocation = scope.textData;  //todo: change to LotName + SlotCode when LotName is set  on lines of setActualSlotCommand

                self.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command)
                    .then((data) => {
                        if (!data) {
                            restoreTextData();
                        }
                        scope.canUpdate = true;
                        this.$state.reload();
                    });
            }
            scope.onCancel = (): void => {
                restoreTextData();
                scope.isInEditMode = false;
            }
            var initializeDirective = () => {


                scope.directiveInitialized = true;
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("textData",
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
        .directive("slotUpdate",
        [
            "$state", "$timeout", "SessionService", "ValetServiceCommand",
            (st, t, s, v) => new SlotUpdateDirective(st, t, s, v)
        ]);
}