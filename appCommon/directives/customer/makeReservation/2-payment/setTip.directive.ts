module AppCommon {
    export interface ISetTipAttrs extends ng.IAttributes {
        identifier: string;
    }

    export interface ISetTipScope extends ng.IScope {
        orderIdentifier: string;
        tip: TipDTO;
        tipInput: TipInput;

        setTip(): void;
        onChange(event: any, isPercentFlag: boolean): void;
    }

    export class TipInput {
        fixedAmount: number;
        percentAmount: number;
    }


    class SetTip implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appCommon/directives/customer/makeReservation/2-payment/setTip.directive.html";
        scope = {
            tip: "=?"
        };

        static instance(): ng.IDirectiveFactory {
            const directive: ng.IDirectiveFactory = () => new SetTip();
            return directive;
        }
        
        link: ng.IDirectiveLinkFn = (scope: ISetTipScope, elements: ng.IAugmentedJQuery, attrs: ISetTipAttrs) => {
            var self = this;
            scope.orderIdentifier = attrs.identifier;

            if (!scope.tip) {
                scope.tip = new TipDTO();
                //scope.tip.IsFromReservation = true;
            }

            scope.tipInput = new TipInput();
            scope.tipInput.percentAmount = scope.tip.IsPercentage ? scope.tip.Amount : 0;
            scope.tipInput.fixedAmount = scope.tip.IsPercentage ? 0 : scope.tip.Amount;
            if (scope.tip.Amount === 0) {
                scope.tip.IsPercentage = null;
            }

            scope.setTip = (): void => {
                if (!!scope.tip) {
                    if (scope.tip.IsPercentage) {
                        scope.tipInput.percentAmount = Math.floor(scope.tipInput.percentAmount * 10) / 10;
                        scope.tip.Amount = scope.tipInput.percentAmount;
                    }
                    else {
                        scope.tipInput.fixedAmount = Math.floor(scope.tipInput.fixedAmount * 100) / 100;
                        scope.tip.Amount = scope.tipInput.fixedAmount;
                    }
                }
            };

            scope.onChange = (event: any, isPercentFlag: boolean): void => {
                if (!scope.tip) {
                    scope.tip = new TipDTO();
                    //scope.tip.IsFromReservation = true;
                }

                scope.tip.IsPercentage = isPercentFlag;
                // reset values
                scope.tipInput.percentAmount = 0;
                scope.tipInput.fixedAmount = 0;
            };
        };
    }

    angular.module("app.common")
        .directive("setTip",
            [() => new SetTip()]);

}