module AppCommon {
    import utils = AppCommon.GenericUtils;

    export interface IOperatingLocationDropdownAttributes extends ng.IAttributes {

    }

    export interface IOperatingLocationDropdownScope extends ng.IScope {
        initialOperatingLocationIdentifier: string;
        operatingLocation: OperatingLocationDTO;
        operatingLocationChoices: OperatingLocationDTO[];
        operatingLocationChanged(): void;
        operatingLocationChangedCallback(newOperatingLocation: OperatingLocationDTO): void;
    }

    class OperatingLocationDropdownDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.operatingLocationsTemplateUrl;
        scope = {
            operatingLocationChangedCallback: "&",
            initialOperatingLocationIdentifier: "="
        };

        static $inject = ["$window", "$timeout", "SessionService", "OperatingLocationRepository"];

        constructor(
            private $window: Window,
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private operatingLocationRepository: AppCommon.OperatingLocationRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IOperatingLocationDropdownScope, elements: ng.IAugmentedJQuery, attrs: IOperatingLocationDropdownAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.operatingLocationChanged = (): void => {
                if (typeof scope.operatingLocation == "undefined") scope.operatingLocation = null;
                if (!!this.$window.localStorage) {
                    this.$window.localStorage.setItem("lastOperatingLocationIdentifier", scope.operatingLocation && scope.operatingLocation.ID || "");
                }
                scope.operatingLocationChangedCallback(({ newOperatingLocation: scope.operatingLocation }) as any);
            }

            this.operatingLocationRepository.fetchAll(AppConfig.APIHOST)
                .then(data => {
                    scope.operatingLocationChoices = data.sort((a, b) => (a.Name < b.Name ? -1 : 1));
                    if (!!scope.operatingLocationChoices && scope.operatingLocationChoices.length > 0) {
                        var initialChoice = scope.initialOperatingLocationIdentifier;
                        if (!initialChoice) {
                            if (!!this.$window.localStorage) {
                                initialChoice = this.$window.localStorage.getItem("lastOperatingLocationIdentifier");
                            }
                        }
                        if (!!initialChoice) {
                            for (let x = 0; x < scope.operatingLocationChoices.length; x++) {
                                if (scope.operatingLocationChoices[x].ID === initialChoice) {
                                    scope.operatingLocation = scope.operatingLocationChoices[x];
                                }
                            }
                        }
                    }
                    scope.operatingLocationChanged();
                });
        }
    }

    angular.module("app.common")
        .directive("operatingLocationDropdown",
        [
            "$window", "$timeout", "SessionService", "OperatingLocationRepository",
            (w, t, s, v) => new OperatingLocationDropdownDirective(w, t, s, v)
        ]);
}