module AppCommon {

    export class PageHeaderController {

        pageTitle: string;

        static $inject = ["$state"];

        constructor(private $state: ng.ui.IStateService) {
            this.pageTitle = $state.current.data.PageTitle;
        }

    }

    angular.module("app.common")
        .controller("PageHeaderController",
        [
            "$state",
            (state) => new PageHeaderController(state)
        ]);
}