module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface IValetSagaUpdateAttributes extends ng.IAttributes {
        canUpdate: string;
    }

    export interface IValetSagaUpdateScope extends ng.IScope {
        canUpdate: boolean;
        ticketIdentifier: string;
        isTicketActive: boolean;
        operatingLocationIdentifier: string;
        allowEdit: boolean;
        valetSagaType: string;
        valetSagaEmployeeIdentifier: string;
        valetSagaEmployeeFriendlyIdentifier: string;
        valetSagaStatus: number;

        directiveInitialized: boolean;
        isInEditMode: boolean;
        valetSagaTypeTitle: string;
        valetSagaStatusTitle: string;
        deleteValetIconTitle: string;

        utils: AppCommon.GenericUtils; 
        ticketUtils: AppCommon.TicketUtils; 

        savingInProgress: boolean;

        onEdit(): void;
        onUpdate(): void;
        onCancel(): void;
        onDelete(): void;        
    }

    class ValetSagaUpdateDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.valetSagaUpdateTemplateUrl;
        scope = {
            ticketIdentifier: "=",
            isTicketActive: "=",
            operatingLocationIdentifier: "=",
            allowEdit: "=",
            valetSagaType: "=",
            valetSagaIdentifier: "=",
            valetSagaEmployeeIdentifier: "=",
            valetSagaEmployeeFriendlyIdentifier: "=",
            valetSagaStatus: "="
        };

        static $inject = ["$timeout", "SessionService", "ValetServiceCommand", "KendoDataSourceService"];

        constructor(
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private valetServiceCommand: AppCommon.ValetServiceCommand,
            private kendoDataSourceService: AppCommon.KendoDataSourceService) {
        }

        link: ng.IDirectiveLinkFn = (scope: IValetSagaUpdateScope, elements: ng.IAugmentedJQuery, attrs: IValetSagaUpdateAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            var createdBy = this.sessionService.userInfo.employeeFriendlyID;
            var valetListDataSource: kendo.data.DataSource;
            var valetSelectorIdentifier: string;
            var valetSelectorType = "kendoComboBox";
            var valetSelectorPlaceholder: string;
            var noValetSelectedMessage: string;
            var confirmDeleteValetMessage: string;
            var valetSagaEmployeeIdentifierCopy: string;
            var valetSagaEmployeeFriendlyIdentifierCopy: string;
            var valetSagaStatusCopy: number;
            var valetSagaController: string;
            var AssignValetCommand: any;
            var UnassignValetCommand: any;
            var valetSagaTypeLower: string;
            var valetSagaStatusToTitle: (status:number) => string;

            scope.utils = AppCommon.GenericUtils;
            scope.ticketUtils = AppCommon.TicketUtils;
            scope.canUpdate = utils.getBooleanAttribute(attrs.canUpdate) && scope.allowEdit && scope.isTicketActive;
            scope.isInEditMode = false;

            var backupValetData = (): void => {
                valetSagaEmployeeIdentifierCopy = scope.valetSagaEmployeeIdentifier;
                valetSagaEmployeeFriendlyIdentifierCopy = scope.valetSagaEmployeeFriendlyIdentifier;
                valetSagaStatusCopy = scope.valetSagaStatus;
            }
            var restoregValetData = (): void => {
                scope.valetSagaEmployeeIdentifier = valetSagaEmployeeIdentifierCopy;
                scope.valetSagaEmployeeFriendlyIdentifier = valetSagaEmployeeFriendlyIdentifierCopy;
                scope.valetSagaStatus = valetSagaStatusCopy;
                scope.valetSagaStatusTitle = valetSagaStatusToTitle(scope.valetSagaStatus);
            }
            var deleteValetData = (): void => {
                scope.valetSagaEmployeeIdentifier = null;
                scope.valetSagaEmployeeFriendlyIdentifier = null;
                scope.valetSagaStatus = null;
                scope.valetSagaStatusTitle = null;
            }
            var setNewValetData = (valet: any): void => {
                scope.valetSagaEmployeeIdentifier = valet.ID;
                scope.valetSagaEmployeeFriendlyIdentifier = valet.ExtendedFriendlyID;
                scope.valetSagaStatus = null;
                scope.valetSagaStatusTitle = null;
            }
            var refreshValetSelector = (): void => {
                var elemData = $(valetSelectorIdentifier).data(valetSelectorType);
                elemData.refresh();
                elemData.value(scope.valetSagaEmployeeIdentifier); // pre-select valet that is on ticket
                if (elemData.selectedIndex < 0) {
                    // valet that is on ticket is not in list, so don't select it
                    elemData.value(null);
                };
            };
            scope.onDelete = (): void => {
                var response = confirm(confirmDeleteValetMessage);
                if (response === false) {
                    return;
                }
                scope.savingInProgress = true;
                backupValetData();
                var command = new UnassignValetCommand();
                command.ID = scope.ticketIdentifier;
                command.CreatedBy = createdBy;
                if (UnassignValetCommand === UnassignRunnerCommandDTO) {
                    command.RemovedEmployeeID = scope.valetSagaEmployeeIdentifier;
                }
                this.valetServiceCommand.doCommand(valetSagaController, command)
                    .then((data) => {
                        if (!data) {
                            restoregValetData();
                        }
                        deleteValetData();
                        scope.savingInProgress = false;
                    });;
            };
            scope.onEdit = (): void => {
                refreshValetSelector();
                scope.isInEditMode = true;
            }
            scope.onUpdate = (): void => {
                scope.savingInProgress = true;
                var elemData = $(valetSelectorIdentifier).data(valetSelectorType);
                if (elemData.selectedIndex < 0) {
                    var response = confirm(noValetSelectedMessage);
                    if (response === false) {
                        scope.isInEditMode = false;
                        scope.savingInProgress = false;
                    }
                    return;
                }
                scope.isInEditMode = false;
                backupValetData();
                setNewValetData(elemData.dataItem(elemData.selectedIndex));
                var command = new AssignValetCommand();
                command.ID = scope.ticketIdentifier.toString();
                command.CreatedBy = createdBy;
                command.EmployeeID = scope.valetSagaEmployeeIdentifier;
                command.EmployeeFriendlyID = scope.valetSagaEmployeeFriendlyIdentifier;
                self.valetServiceCommand.doCommand(valetSagaController, command)
                    .then((data) => {
                        if (!data) {
                            restoregValetData();
                        }
                        scope.savingInProgress = false;
                    });
            }
            scope.onCancel = (): void => {
                scope.isInEditMode = false;
            }
            var initializeDirective = () => {
                if (scope.valetSagaType === "greeter") {
                    valetSagaStatusToTitle = AppCommon.TicketUtils.greeterSagaStatusToTitle;
                    valetSagaController = ValetConfiguration_Routing.GreeterSagaCommandRoute;
                    AssignValetCommand = AssignSpecificGreeterCommandDTO;
                    UnassignValetCommand = UnassignSpecificGreeterCommandDTO;      
                    scope.deleteValetIconTitle = "Remove specifically assigned greeter.";          
                } else if (scope.valetSagaType === "runner") {
                    valetSagaStatusToTitle = AppCommon.TicketUtils.runnerSagaStatusToTitle;
                    valetSagaController = ValetConfiguration_Routing.RunnerSagaCommandRoute;
                    AssignValetCommand = AssignRunnerCommandDTO;
                    UnassignValetCommand = UnassignRunnerCommandDTO;
                    scope.deleteValetIconTitle = "Remove assigned runner.";
                } else {
                    console.error("Unsupported valet saga type: " + scope.valetSagaType);
                    return;
                }
                scope.valetSagaStatusTitle = valetSagaStatusToTitle(scope.valetSagaStatus);
                scope.valetSagaTypeTitle = AppCommon.GenericUtils.camelToTitle(scope.valetSagaType);
                valetSagaTypeLower = AppCommon.GenericUtils.camelToLower(scope.valetSagaType);
                valetSelectorIdentifier = "#valet-selector-" + scope.valetSagaType;
                valetSelectorPlaceholder = "Select " + scope.valetSagaTypeTitle;
                noValetSelectedMessage = "No " + valetSagaTypeLower +" selected to save. Press OK to continue editing or Cancel to cancel editing.";
                confirmDeleteValetMessage = "Are you sure you want to delete " + valetSagaTypeLower + " " + scope.valetSagaEmployeeFriendlyIdentifier + " from this ticket?";

                valetListDataSource = self.kendoDataSourceService.getDataSource(
                    ValetConfiguration_Routing.ValetRoute,
                    ValetConfiguration_Routing_ValetMethods.GetValetsOnShiftByOperatingLocationID,
                    scope.operatingLocationIdentifier,
                    null,
                    null,
                    AppCommon.ValetUtils.valetParseFunction);

                var elem = $(valetSelectorIdentifier);
                elem.kendoComboBox({
                    placeholder: valetSelectorPlaceholder,
                    dataTextField: "ExtendedFriendlyID",
                    dataValueField: "ID",
                    dataSource: valetListDataSource
                });
                scope.directiveInitialized = true;
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("valetSagaType",
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
        .directive("valetSagaUpdate",
        [
            "$timeout", "SessionService", "ValetServiceCommand", "KendoDataSourceService",
            (t, s, v, k) => new ValetSagaUpdateDirective(t, s, v, k)
        ]);
}