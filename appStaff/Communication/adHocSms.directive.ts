module AppStaff {
    import utils = AppCommon.GenericUtils;

    export interface IAdHocSmsAttributes extends ng.IAttributes {
    }

    export interface IAdHocSmsScope extends ng.IScope {
        directiveInitialized: boolean;
        reference: MessageContextDTO;
        mobileNumber: string;
        customerName: string;
        mobileNumber2: string;
        email: string;
        smsContent: string;
        createdBy: string;

        utils: AppCommon.GenericUtils; // for html calls
        
        smsStatusMsg: string;
        
        onSend(): void;
    }

    class AdHocSmsDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = ConfigureRoutesForCommunicationContext.adHocSmsTemplateUrl;
        scope = {
            reference: "=",
            mobileNumber: "=",
            customerName: "="
        };

        static $inject = ["$timeout", "SessionService", "CommunicationService"];

        constructor(
            private timeout: ng.ITimeoutService,
            private sessionService: AppCommon.SessionService,
            private communicationService: AppCommon.CommunicationService) {
        }

        link: ng.IDirectiveLinkFn = (scope: IAdHocSmsScope, elements: ng.IAugmentedJQuery, attrs: IAdHocSmsAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.utils = AppCommon.GenericUtils;
            scope.createdBy = this.sessionService.userInfo.employeeFriendlyID;
            
            scope.onSend = (): void => {
                var command = new SendSmsCommandDTO();
                command.ID = AppCommon.GuidService.NewGuid();
                command.CreatedBy = scope.createdBy;
                command.MessageContext = scope.reference;
                command.Options = new SmsOptionsDTO();
                command.Options.ToMobile = scope.mobileNumber;
                command.Options.Message = scope.smsContent;

                self.communicationService.doCommand(command)
                    .then((data) => {
                        if (data) {
                            // success
                            scope.smsStatusMsg = "Message was sent.";
                            self.communicationService.getSmsByID(command.ID)
                                .then((data) => {
                                    if (data) {
                                        scope.smsStatusMsg = AppCommon.CommunicationUtils.MessageStatusToTitle(data.Status);
                                    }
                                });


                            if (!!scope.mobileNumber2) {
                                command.ID = AppCommon.GuidService.NewGuid();  
                                command.Options.ToMobile = scope.mobileNumber2;
                                self.communicationService.doCommand(command);
                            }

                        } else {
                            // false
                            scope.smsStatusMsg = "There was a problem with the request. Check message status before attempting to send again.";
                        }
                    });
            }
            var initializeDirective = () => {
                scope.directiveInitialized = true;
            }
            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("mobileNumber",
                    (newValue) => {
                        if (typeof (newValue) !== "undefined") {
                            deregisterWait();
                            initializeDirective();
                        }
                    });;
            }
            var waitForDom = () => {
                waitForScopeVariables();
            }
            setTimeout(waitForDom, 0);
        }
    }

    angular.module("app.staff")
        .directive("adHocSms",
        [
            "$timeout", "SessionService", "CommunicationService",
            (t, s, c) => new AdHocSmsDirective(t, s, c)
        ]);
}