module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface ISearchAttributes extends ng.IAttributes {
        embed: string; 
    }

    export interface ISearchScope extends ng.IScope {
        utils: AppCommon.GenericUtils; 

        searchParameters: string;
        search(): void;
        embed: boolean; 
        embedSearchCallback(terms: string): void;
    }

    class SearchDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.searchTemplateUrl;
        scope = {
            embedSearchCallback: "&"
        };

        static $inject = ["$state", "$stateParams"];

        constructor(private $state: any, private $stateParams: any) {
        }

        link: ng.IDirectiveLinkFn = (scope: ISearchScope, elements: ng.IAugmentedJQuery, attrs: ISearchAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");
            scope.embed = getBooleanAttribute(attrs.embed);  // used on embed search form (e.g: NewIssue modal)

            scope.search = (): void => {
                if (scope.embed) {
                    scope.embedSearchCallback(({ terms: scope.searchParameters }) as any);
                }
                else {
                    self.$state.go("search-results",
                        {
                            terms: scope.searchParameters
                        });
                }
            }
        }
    }

    angular.module("app.staff")
        .directive("search",
        [
            "$state", "$stateParams",
            (state, sp) => new SearchDirective(state, sp)
        ]);
}