module AppCommon {
    export interface ISplitPaymentReservedParkingDaysAttrs extends ng.IAttributes {
    }

    export interface ISplitPaymentReservedParkingDaysScope extends ng.IScope {
        directiveInitialized: boolean;
        analyticsEventName: string;
        reservedDays: any[];
        otherOrderReservedDays: ReservedParkingDayDTO[];
        allowanceRate: number;
        isAllowanceOrder: boolean;

        moveDayToAnotherOrder(day, index): void;
    }

    class SplitPaymentReservedParkingDaysDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.splitPaymentReservedParkingDaysListTemplateUrl;

        scope = {
            analyticsEventName: "@",
            reservedDays: "=?",
            otherOrderReservedDays: "=?",
            allowanceRate: "=?",
            isAllowanceOrder: "=?"
        };

        static $inject = ["SessionService"];

        constructor(private sessionService: AppCommon.SessionService) {
        }

        link: ng.IDirectiveLinkFn = (scope: ISplitPaymentReservedParkingDaysScope, elements: ng.IAugmentedJQuery, attrs: ISplitPaymentReservedParkingDaysAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            
            scope.moveDayToAnotherOrder = (day: ReservedParkingDayDTO, index: number) => {
                if (scope.otherOrderReservedDays === null) {
                    scope.otherOrderReservedDays = [];
                }
                if (!!scope.reservedDays && !!scope.otherOrderReservedDays) {
                    //var foundOtherOrderDay = scope.otherOrderReservedDays.filter(x => x.SequenceNumber === day.SequenceNumber)[0];
                    var foundOtherOrderDay = null;
                    var foundIndex = IESafeUtils.arrayFindIndex(scope.otherOrderReservedDays, (x) => { return x.SequenceNumber === day.SequenceNumber }, this);
                    if (foundIndex > -1) {
                        foundOtherOrderDay = scope.otherOrderReservedDays[foundIndex];
                    }
                                        
                    //switch amounts
                    if (scope.isAllowanceOrder) {

                        //move from Allowance
                        if (foundOtherOrderDay !== null) {
                            foundOtherOrderDay.Rate = Number(foundOtherOrderDay.Rate) + Number(day.Rate);
                            foundOtherOrderDay.Amount = foundOtherOrderDay.Rate * foundOtherOrderDay.Quantity;
                        } else {
                            var newDay = new ReservedParkingDayDTO;
                            newDay.SequenceNumber = day.SequenceNumber;
                            newDay.Description = day.Description;
                            newDay.Quantity = day.Quantity;
                            newDay.Rate = day.Rate;
                            newDay.Amount = newDay.Rate * newDay.Quantity;
                            newDay.TieredRate_Name = day.TieredRate_Name;

                            var insertAtIndex = IESafeUtils.arrayFindIndex(scope.otherOrderReservedDays, (x) => { return x.SequenceNumber > day.SequenceNumber }, this);
                            if (insertAtIndex < 0) insertAtIndex = scope.otherOrderReservedDays.length;
                            scope.otherOrderReservedDays.splice(insertAtIndex, 0, newDay);
                        }
                        scope.reservedDays.splice(index, 1);
                    } else {

                        //move from CatchAll
                        var newRate = 0;
                        var difference = Number(day.Amount) - Number(scope.allowanceRate);

                        if (foundOtherOrderDay != null) {
                            if (foundOtherOrderDay.Rate !== scope.allowanceRate) {
                                if (difference < 0) {
                                    newRate = day.Rate;
                                    day.Rate = 0;
                                } else {
                                    newRate = scope.allowanceRate;
                                    day.Rate = difference;
                                }
                                day.Amount = day.Rate * day.Quantity;

                                foundOtherOrderDay.Rate = scope.allowanceRate;
                                foundOtherOrderDay.Amount = foundOtherOrderDay.Rate * foundOtherOrderDay.Quantity;
                            }
                        } else {                                                     
                            if (difference < 0) {
                                newRate = day.Rate;
                                day.Rate = 0;
                            } else {
                                newRate = scope.allowanceRate;
                                day.Rate = difference;
                            }
                            day.Amount = day.Rate * day.Quantity;

                            var newDay = new ReservedParkingDayDTO;
                            newDay.SequenceNumber = day.SequenceNumber;
                            newDay.Description = day.Description;
                            newDay.Quantity = day.Quantity;
                            newDay.Rate = newRate;
                            newDay.Amount = newDay.Rate * newDay.Quantity;
                            newDay.TieredRate_Name = day.TieredRate_Name;

                            var insertAtIndex = IESafeUtils.arrayFindIndex(scope.otherOrderReservedDays, (x) => { return x.SequenceNumber > newDay.SequenceNumber }, this);
                            if (insertAtIndex < 0) insertAtIndex = scope.otherOrderReservedDays.length;
                            scope.otherOrderReservedDays.splice(insertAtIndex, 0, newDay);
                        }
                    }
                }
            };

            var initializeDirective = (reservedDays: any) => {
                //init values
                scope.reservedDays = reservedDays;

                scope.directiveInitialized = true;
            }
            var waitForScopeVariables = () => {
                scope.$watch("reservedDays",
                    (newValue) => {
                        if (typeof (newValue) !== "undefined") {
                            initializeDirective(newValue);
                        }
                    });
            }
            var waitForDom = () => {
                waitForScopeVariables();
            }
            setTimeout(waitForDom, 0);
        };
    }

    angular.module("app.common")
        .directive("splitPaymentReservedParkingDays",
        [
            "SessionService",
            (sessionService) => new SplitPaymentReservedParkingDaysDirective(sessionService)
        ]);
}