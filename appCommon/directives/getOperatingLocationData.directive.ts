module AppCommon {
    export interface IGetOperatingLocationDataScope extends ng.IScope {
        operatingLocationIdentifier: string;
        operatingLocationObject: OperatingLocationDTO;
    }

    class GetOperatingLocationData implements ng.IDirective {
        restrict = "E";
        scope = {
            operatingLocationIdentifier: "=",
            operatingLocationObject: "="
        };

        static $inject = ["OperatingLocationRepository"];

        constructor(
            private operatingLocationRepository: AppCommon.OperatingLocationRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IGetOperatingLocationDataScope, elements: ng.IAugmentedJQuery, attrs: ng.IAttributes, ngModel: ng.INgModelController) => {
            var self = this;
            var getOperatingLocationData = () => {
                self.operatingLocationRepository.getByID(scope.operatingLocationIdentifier, AppConfig.APIHOST)
                    .then(data => {
                        if (!!data) {
                            scope.$evalAsync(() => { scope.operatingLocationObject = data; });
                        } else {
                            scope.$evalAsync(() => { scope.operatingLocationObject = null; });
                        }
                    });
            }
            scope.$watch("operatingLocationIdentifier",
                (newValue) => {
                    if (typeof (newValue) == "undefined") {
                        scope.$evalAsync(() => { scope.operatingLocationObject = null; });
                    }
                    else {
                        getOperatingLocationData();
                    }
                });
        };
    }

    angular.module("app.common")
        .directive("getOperatingLocationData",
        ["OperatingLocationRepository",
            (olRepository) => new GetOperatingLocationData(olRepository)]);
}