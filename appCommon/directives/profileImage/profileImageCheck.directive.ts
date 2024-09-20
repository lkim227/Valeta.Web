module AppCommon {
    import utils = AppCommon.GenericUtils;

    export interface IProfileImageCheckAttributes extends ng.IAttributes {
        src: string;
        onErrorSrc: string;
    }

    export interface IProfileImageCheckScope extends ng.IScope {
        directiveInitialized: boolean;
    }

   class ProfileImageCheckDirective implements ng.IDirective {
        restrict = "A";

        static $inject = [];

        constructor() {}

        static instance(): ng.IDirectiveFactory {
            var directive: ng.IDirectiveFactory = () => new ProfileImageCheckDirective();
            return directive;
        }

        link: ng.IDirectiveLinkFn = (scope: IProfileImageCheckScope, element: ng.IAugmentedJQuery, attrs: IProfileImageCheckAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;

            element.bind('error', function () {
                if (attrs.src != attrs.onErrorSrc) {
                    attrs.$set('src', attrs.onErrorSrc);
                }
            });
        }


    }

    angular.module("app.common")
        .directive("onErrorSrc",
        [
            () => new ProfileImageCheckDirective()
        ]);
}