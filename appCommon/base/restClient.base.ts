module AppCommon {
    export class RestClientBase {

        static authorizationHeader: string;

        static $inject = ["Restangular", "ErrorHandlingService"];

        constructor(protected restng: restangular.IService, protected errorHandlingService: ErrorHandlingService, apiHost: string = AppConfig.APIHOST) {
            this.intialize(RestClientBase.authorizationHeader, apiHost);
        }

        protected intialize(authorizationHeader: string, apiHost: string): void {
            var iscope: any = this;
            this.restng.setBaseUrl(apiHost);
            this.restng.setDefaultHeaders({
                "Content-Type": "application/json;charset=UTF-8",
                "Authorization": authorizationHeader
            });

            if (iscope.key) {
                this[iscope.key] = [];
            }

            if (iscope.key && iscope.model) {
                // Extend any objects sourced from Local Storage
                angular.forEach(iscope[iscope.key],
                    function(obj) {
                        angular.extend(obj, iscope.model);
                    });
            }
        }

        protected formatExceptionMessage(controllerName: string, exceptionMessage: string) {
            return `${controllerName}: ${exceptionMessage}`;
        }

        protected formatNoDataMessage(controllerName: string) {
            return `We're sorry.  There is a problem with getting data for ${controllerName}.  Our engineers are working to fix the problem.`;
        }
    }
}