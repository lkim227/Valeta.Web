module AppCommon {

    export interface IDirectiveBaseScope extends ng.IScope {
        loadingPromise: ng.IPromise<any>;
        cgBusyConfiguration: any;
    }

    export abstract class DirectiveBase implements ng.IDirective {
        restrict = "E";
        
        initializeScope(scope: IDirectiveBaseScope) {
            scope.cgBusyConfiguration = { promise: scope.loadingPromise, message: "Loading Your Data" };
        }
    }
}