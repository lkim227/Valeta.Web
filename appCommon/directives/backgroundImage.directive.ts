module AppCommon {
    angular.module("app.common").directive('backgroundImage', function () {
        return function (scope, element, attrs) {
            attrs.$observe('backgroundImage', function (value) {
                element.css({
                    'background-image': 'url(' + value + ')',
                    'background-size': 'cover'
                });
            });
        };
    });    
}
