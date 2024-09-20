// Wrap existing code in a directive 
module AppCommon {
    angular.module("app.common")
        .directive("makeReservation",
        [
            () => ({
                restrict: "E",
                controller: "MakeReservationController",
                controllerAs: "makeReservationVm",
                templateUrl: "/appCommon/directives/customer/makeReservation/makeReservation.directive.html"
            })
        ]);
}