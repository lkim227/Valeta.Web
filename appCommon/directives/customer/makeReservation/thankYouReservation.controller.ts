module AppCommon {
    export class ThankYouReservationController extends AppCommon.ControllerBase {
        pageTitle: string;
        customerAccountRouting: AppCommon.CustomerAccountUiRouting;
        reservation: ReservationDTO;

        reservationID: string;
        isReserved: boolean;

        static $inject = ["$window", "$stateParams", "$state", "$scope", "AuthService", "ErrorHandlingService", "ReservationRepository"];

        constructor(private $window: Window,
            private $stateParams: any,
            private $state: ng.ui.IStateService,
            private $scope: any,
            private authService: AppCommon.AuthService,
            private errorHandlingService: AppCommon.ErrorHandlingService,
            private reservationRepository: AppCommon.ReservationRepository
        ) {
            super(authService);
            
            this.pageTitle = $state.current.data.PageTitle;
            this.customerAccountRouting = $state.current.data.MakeReservationRoute;
            this.reservationID = $stateParams.reservationID;

            reservationRepository.getByID(this.reservationID, AppConfig.APIHOST)
                .then((result) => {
                        this.reservation = result;
                        this.isReserved = this.reservation.Status === ReservationStatus.Reserved || this.reservation.Status === ReservationStatus.Pending;
                    },
                    (ex: any) => {
                        this.errorHandlingService.showPageError(ex.data.ExceptionMessage);
                    });
        }

        editReservation(): void {
            if (!!this.$window.localStorage) {
                this.$window.localStorage.setItem("incompleteReservationID", this.reservationID);
            }

            this.$state.go("make-reservation");
        }
        viewTicket = (ticketNumber: string): void => {
            this.$state.go("ticket");
            var url = this.$state.href("ticket", { ticketNumber: ticketNumber });
            window.open(url, "_self");
        }

        viewBillingDocument = (id: string): void => {
            var url = this.$state.href("billing-document", { ticketIdentifier: id });
            window.open(url, "_self");
        }
    }

    angular.module("app.common")
        .controller("ThankYouReservationController",
        [
            "$window", "$stateParams", "$state", "$scope", "AuthService", "ErrorHandlingService", "ReservationRepository",
            (win, sp, state, scope, auth, errSvc, resRepo) => new ThankYouReservationController(win, sp, state, scope, auth, errSvc, resRepo)
        ]);
}