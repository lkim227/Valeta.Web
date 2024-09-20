module AppStaff {
    import AppCommonConfig = AppCommon.AppCommonConfig;

    export class SendMessageController extends AppCommon.ControllerBase {
        mobilePhone: string;
        customerName: string;
        identifier: string;
        referenceContext: string;
        reference: MessageContextDTO;

        static $inject = ["$stateParams", "AuthService", "SessionService"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private authService: AppCommon.AuthService,
            private sessionService: AppCommon.SessionService) {

            super(authService);

            this.mobilePhone = this.$stateParams["mobilePhone"];
            this.customerName = this.$stateParams["customerName"];
            this.identifier = this.$stateParams["identifier"];
            this.referenceContext= this.$stateParams["referenceContext"];

            this.reference = AppCommon.CommunicationUtils.buildReferenceDTO(this.identifier, this.referenceContext, this.customerName);
        }
    }

    angular.module("app.staff")
        .controller("SendMessageController",
        [
            "$stateParams", "AuthService", "SessionService",
            (stateParams, auth, sess) => new SendMessageController(stateParams, auth, sess)
        ]);
}