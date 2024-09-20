module AppStaff {
    export interface IValetTipsAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IValetTipsScope extends ng.IScope {
        directiveInitialized: boolean;
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        accessLevel: AccessLevel;
        hasViewAccess: boolean;
        createdBy: string;

        showForLoggedInEmployeeOnly: boolean;

        loadingPromise: ng.IPromise<any>;
        cgBusyConfiguration: any; 

        selectedOperatingLocation: OperatingLocationDTO;
        onChangeOperatingLocation(newOperatingLocation: OperatingLocationDTO): void;

        formMessages: any;

        allEmployees: boolean;
        valetList: EmployeeDTO[];
        selectedValet: EmployeeDTO;
        selectedValetChanged(): void;
        
        gotTips: boolean;
        tips: ValetTipDTO[];
        showTipsDetails: boolean;
        tipsDetails: ValetTipDTO[];

        filterFromDateTime: string;
        filterToDateTime: string;
        applyDateFilter(): void;
        getTipDetails(): void;
        clearData(): void;
    }

    class ValetTipsDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "Employee/valetTips.directive.html";
        scope = {
            showForLoggedInEmployeeOnly: "="
        };

        static $inject = ["$state", "$stateParams", "SessionService", "AuthService", "EmployeeRepository", "TipAndSumQuery"];

        constructor(
            private $state: any,
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private authService: AppCommon.AuthService,
            private employeeRepository: AppCommon.EmployeeRepository,
            private TipAndSumQuery: AppCommon.TipAndSumQuery) {
        }

        link: ng.IDirectiveLinkFn = (scope: IValetTipsScope, elements: ng.IAugmentedJQuery, attrs: IValetTipsAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;

            scope.onChangeOperatingLocation = (newOperatingLocation: OperatingLocationDTO): void => {
                if (newOperatingLocation == null) {
                    scope.selectedOperatingLocation = null;
                    return;
                }
                scope.selectedOperatingLocation = newOperatingLocation;
            };

            scope.selectedValetChanged = (): void => {
                scope.clearData();
            }
            scope.clearData = (): void => {
                scope.tips = null;
                scope.gotTips = false;
                scope.tipsDetails = null;
                scope.showTipsDetails = false;
            }
        
            scope.applyDateFilter = (): void => {
                scope.clearData();
                if (scope.showForLoggedInEmployeeOnly) {
                    this.TipAndSumQuery.getListByValetId(this.sessionService.userInfo.employeeID, scope.filterFromDateTime, scope.filterToDateTime)
                        .then((data) => {
                            scope.tips = data;
                            scope.gotTips = true;
                        });
                } else {
                    if (scope.allEmployees) {
                        this.TipAndSumQuery.getSumAll(scope.filterFromDateTime, scope.filterToDateTime, scope.selectedOperatingLocation.ID)
                            .then((data) => {
                                scope.tips = data;
                                scope.gotTips = true;
                            });
                    } else {
                        if (!!scope.selectedValet) {
                            this.TipAndSumQuery.getListByValetId(scope.selectedValet.ID, scope.filterFromDateTime, scope.filterToDateTime)
                                .then((data) => {
                                    scope.tips = data;
                                    scope.gotTips = true;
                                });
                        }
                    }
                }
            };

            scope.getTipDetails = (): void => {
                this.TipAndSumQuery.getListAll(scope.filterFromDateTime, scope.filterToDateTime, scope.selectedOperatingLocation.ID)
                    .then((data) => {
                        scope.tipsDetails = data;
                        scope.showTipsDetails = true;
                        scope.gotTips = true;
                    });
            }

            var initializeDirective = () => {
                if (scope.showForLoggedInEmployeeOnly) {
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
                        scope.allEmployees = true;
                    }
                }

                scope.directiveInitialized = true;
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("filterFromDateTime",
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
        };
    }

    angular.module("app.staff")
        .directive("valetTips",
        ["$state", "$stateParams", "SessionService", "AuthService", "EmployeeRepository", "TipAndSumQuery",
            (s, st, ss, auth, e, v) => new ValetTipsDirective(s, st, ss, auth, e, v)]);
}