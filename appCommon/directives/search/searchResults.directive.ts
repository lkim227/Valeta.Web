module AppCommon {
    import utils = AppCommon.GenericUtils;

    export interface ISearchResultsAttributes extends ng.IAttributes {
        enableSelector: string;
        getCustomersOnly: boolean;
    }

    export interface ISearchResultsScope extends ng.IScope {
        utils: AppCommon.GenericUtils; // for html calls

        searchQuery: string;
        hasNoResults: boolean;
        searchResults: Array<any>;
        searchUtils: AppCommon.SearchUtils;

        embedSearchCallback(terms: string): void;
        enableSelector: boolean;
        getCustomersOnly: boolean;
        selectedSearchResult: OmnisearchQueryResult;
        selectResult(data: OmnisearchQueryResult): void;
        referenceSelectedCallback(selected: OmnisearchQueryResult): void;
    }

    class SearchResultsDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = "/appCommon/directives/search/searchResults.directive.html";
        scope = {
            referenceSelectedCallback: "&?"
        };

        static $inject = ["$stateParams", "AuthService", "SessionService", "Omnisearch"];

        constructor(
            private $stateParams: any,
            private authService: AppCommon.AuthService,
            private sessionService: AppCommon.SessionService,
            private omnisearch: Omnisearch) {
        }

        link: ng.IDirectiveLinkFn = (scope: ISearchResultsScope, elements: ng.IAugmentedJQuery, attrs: ISearchResultsAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.searchUtils = AppCommon.SearchUtils;
            scope.hasNoResults = false;     //assume we have results
            scope.enableSelector = getBooleanAttribute(attrs.enableSelector);  // used on embed search (e.g: NewIssue modal)
            scope.getCustomersOnly = getBooleanAttribute(attrs.getCustomersOnly);  //used on customer admin

            scope.searchQuery = self.$stateParams.terms; // OMNI central search-results page
            if (!!scope.searchQuery) {
                self.omnisearch.get(scope.searchQuery, scope.getCustomersOnly)
                    .then(data => {
                        scope.searchResults = data;

                        for (var i = 0; i < scope.searchResults.length; i++) {
                            scope.searchResults[i].IsChecked = false;
                        }

                        scope.hasNoResults = (scope.searchResults == null || scope.searchResults.length === 0);
                    });
            }


            scope.embedSearchCallback = (terms: string): void => {
                scope.searchQuery = terms;
                self.omnisearch.get(scope.searchQuery, scope.getCustomersOnly)
                    .then(data => {
                        scope.searchResults = data; // embedResults
                        scope.hasNoResults = (scope.searchResults == null || scope.searchResults.length === 0);
                    });
            }

            scope.selectResult = (dataItem: OmnisearchQueryResult): void => {
                // maniuplate this object on parent controller to be more flexible to scale
                scope.referenceSelectedCallback(({ selected: dataItem }) as any);

                for (var i = 0; i < scope.searchResults.length; i++) {
                    if (scope.searchResults[i].ID === dataItem.ID) scope.searchResults[i].IsChecked = true;
                    else scope.searchResults[i].IsChecked = false;
                }
            }
        }
    }

    angular.module("app.common")
        .directive("searchResults",
        [
            "$stateParams", "AuthService", "SessionService", "Omnisearch",
            (sp, auth, sess, os) => new SearchResultsDirective(sp, auth, sess, os)
        ]);
}