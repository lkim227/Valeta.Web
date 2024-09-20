module AppCommon {
// Use with ng-repeat to call a custom function after the ng-repeat has fully rendered
// http://www.jomendez.com/2015/02/05/angularjs-ng-repeat-onfinishrender-directive/
    angular.module("app.common")
        .directive("onFinishRender",
        [
            "$timeout", "$parse", function($timeout, $parse) {
                return {
                    restrict: "A",
                    link: function(scope, element, attr) {
                        if (scope.$last === true) {
                            $timeout(function() {
                                scope.$emit("ngRepeatFinished");
                                if (!!attr.onFinishRender) {
                                    $parse(attr.onFinishRender)(scope);
                                }
                            });
                        }

                        if (!!attr.onStartRender) {
                            if (scope.$first === true) {
                                $timeout(function() {
                                    scope.$emit("ngRepeatStarted");
                                    if (!!attr.onStartRender) {
                                        $parse(attr.onStartRender)(scope);
                                    }
                                });
                            }
                        }
                    }
                };
            }
        ]);
}