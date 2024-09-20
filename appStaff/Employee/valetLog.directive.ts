module AppStaff {
    export interface IValetLogAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IValetLogScope extends ng.IScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        accessLevel: AccessLevel;
        hasViewAccess: boolean;
        createdBy: string;

        showForLoggedInEmployeeOnly: boolean;

        loadingPromise: ng.IPromise<any>;
        cgBusyConfiguration: any; 

        formMessages: any;

        valetList: EmployeeDTO[];
        selectedValet: EmployeeDTO;
        selectedValetChanged(): void;

        gotEvents: boolean;
        currentObjectEvents: Array<any>;
        toggleInfo(index: number): void;

        filterFromDateTime: string;
        filterToDateTime: string;
        applyDateFilter(): void;
    }

    class ValetLogDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "Employee/valetLog.directive.html";
        scope = {
            showForLoggedInEmployeeOnly: "="        
        };

        static $inject = ["$state", "$stateParams", "SessionService", "AuthService", "EmployeeRepository", "SagaValetEvents"];

        constructor(
            private $state: any,
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private employeeRepository: AppCommon.EmployeeRepository,
            private sagaValetEvents: AppStaff.SagaValetEvents) {
        }

        link: ng.IDirectiveLinkFn = (scope: IValetLogScope, elements: ng.IAugmentedJQuery, attrs: IValetLogAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;

            if (scope.showForLoggedInEmployeeOnly) {
                this.sagaValetEvents.getByIDAndDate(this.sessionService.userInfo.employeeID, scope.filterFromDateTime, scope.filterToDateTime)
                    .then((dataEvents) => {
                        scope.currentObjectEvents = AppCommon.EventUtils.parseEventsHtml(dataEvents);
                        scope.gotEvents = true;
                    });
            } else {
                var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

                scope.canCreate = getBooleanAttribute(attrs.canCreate);
                scope.canUpdate = getBooleanAttribute(attrs.canUpdate);
                scope.canDelete = getBooleanAttribute(attrs.canDelete);

                scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.dispatch);
                scope.hasViewAccess = scope.accessLevel >= AccessLevel.View;

                if (scope.hasViewAccess) {
                    this.employeeRepository.fetchAll(AppConfig.APIHOST)
                        .then((results) => {
                            scope.valetList = results;
                        });
                }
            }

            scope.selectedValetChanged = (): void => {
                scope.currentObjectEvents = null;
                scope.gotEvents = false;
            }

            scope.applyDateFilter = (): void => {
                if (!!scope.selectedValet && !!scope.filterFromDateTime && !!scope.filterToDateTime) {
                    this.sagaValetEvents.getByIDAndDate(scope.selectedValet.ID, scope.filterFromDateTime, scope.filterToDateTime)
                        .then((dataEvents) => {
                            scope.currentObjectEvents = AppCommon.EventUtils.parseEventsHtml(dataEvents);
                            scope.gotEvents = true;
                        });
                }
            };
            
            scope.toggleInfo = (index: number): void => {
                var event = scope.currentObjectEvents[index];

                // toggle event content 
                if (event.display)
                    $($('.formatted-object')[index]).css({ "height": "32px", "overflow-y": "hidden" });
                else
                    $($('.formatted-object')[index]).css({ "height": "auto", "overflow-y": "visible" });

                event.display = !event.display;
            }
        };

    }

    angular.module("app.staff")
        .directive("valetLog",
        ["$state", "$stateParams", "SessionService", "AuthService", "EmployeeRepository", "SagaValetEvents", (s, st, ss, auth, e, v) => new ValetLogDirective(s, st, ss, auth, e, v)]);
}