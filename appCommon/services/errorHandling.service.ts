module AppCommon {
    export interface IErrorHandlingService {
        showFormError(errorMessage: string, element: ng.IAugmentedJQuery);
        showPageError(errorMessage: string);
        showPageErrorFromErrorObject(errorObject: any);
        removePageErrors();
    }

    export class ErrorHandlingService implements IErrorHandlingService {

        static $inject = ["$analytics"];

        constructor(private $analytics: angulartics.IAnalyticsService) {}

        showFormError(errorMessage: string, element: ng.IAugmentedJQuery): void {
            const contentToAdd = `<div class='form-errorBox'><span><span class='glyphicon glyphicon-ban-circle'></span>${errorMessage}</span></div>`;
            element.after(contentToAdd);

            this.$analytics.eventTrack(errorMessage, { category: "Error-Form" });
        }

        showPageError(errorMessage: string, errorBoxCSSClass: string = "form-errorBox", toolTipText: string = ""): void {
            this.removePageErrors();
            const foundElement = document.getElementById("pageErrorArea");
            const formattedErrorMessage = errorMessage.replace(/(?:\r\n|\r|\n)/g, "<br />");
            const contentToAdd = `<div class='${errorBoxCSSClass}'><span><span class='glyphicon glyphicon-ban-circle' title='${toolTipText}'></span>${formattedErrorMessage}</span></div>`;
            angular.element(foundElement).after(contentToAdd);

            this.$analytics.eventTrack(errorMessage, { category: "Error-Page" });
        }

        showPageErrorFromErrorObject(errorObject: any, appendMessage:string = "", errorBoxCSSClass: string = "form-errorBox"): void {
            var bestErrorMessage = "Unknown error";
            var toolTipText = "";

            if (!!errorObject.data) {
                this.showPageErrorFromErrorObject(errorObject.data, appendMessage, errorBoxCSSClass);
                return;
            }

            if (!!errorObject.FriendlyMessage) {
                if (!!errorObject.DebugMessage && errorObject.FriendlyMessage !== errorObject.DebugMessage) {
                    toolTipText = errorObject.DebugMessage;
                }

                bestErrorMessage = errorObject.FriendlyMessage;
                if (!!errorObject.SuggestedAction && errorObject.SuggestedAction.length > 0) {
                    bestErrorMessage += "  " + errorObject.SuggestedAction;
                }
                
            } else {
                if (!!errorObject.ExceptionMessage) {
                    bestErrorMessage = errorObject.ExceptionMessage;
                } else {
                    if (!!errorObject.DebugMessage) {
                        bestErrorMessage = errorObject.DebugMessage;
                    }
                }
            }

            if (!!appendMessage) {
                bestErrorMessage += bestErrorMessage + "<br /><br />" + appendMessage;
            }
            this.showPageError(bestErrorMessage, errorBoxCSSClass, toolTipText);
        }

        removePageErrors(): void {
            const matches = document.querySelectorAll(".form-errorBox");
            for (let i = 0; i < matches.length; i++) {
                angular.element(matches[i]).remove();
            }
        }
    }

    angular.module("app.common")
        .service("ErrorHandlingService",
        [
            "$analytics",
            (an) => new ErrorHandlingService(an)
        ]);
}