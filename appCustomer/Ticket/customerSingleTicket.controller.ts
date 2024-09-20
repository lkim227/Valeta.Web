module AppCustomer {

    export class CustomerSingleTicketController extends AppCommon.ControllerBase {
        ticketNumberParam: string;
        ticket: CustomerTicketDTO;
        billing: BillingQueryResult;
        utils: AppCommon.GenericUtils;
        flightUtils: AppCommon.FlightUtils;
        travelFromCustomer: TravelDirection;
        travelToCustomer: TravelDirection;
        isTicketClosed: boolean;
        isTicketActive: boolean;

        static $inject = ["$stateParams", "AuthService", "SessionService", "CustomerTicketQuery", "BillingQuery"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private authService: AppCommon.AuthService,
            private sessionService: AppCommon.SessionService,
            private ticketRepository: AppCommon.CustomerTicketQuery,
            private billingQuery: AppCommon.BillingQuery
        ) {

            super(authService);

            this.ticketNumberParam = this.$stateParams["ticketNumber"];
            this.ticket = null;
            this.utils = AppCommon.GenericUtils;
            this.flightUtils = AppCommon.FlightUtils;
            this.travelFromCustomer = TravelDirection.FromCustomer;
            this.travelToCustomer = TravelDirection.ToCustomer;

            this.getTicket();
        }


        getTicket = (): void => {
            var accountID;

            if (_.includes(this.sessionService.userInfo.userRoles, "Employee")) {
                // probably is some staff user
                accountID = this.$stateParams["customerIdentifier"];
            }
            else {
                // otherwise is customer logged on account
                accountID = this.sessionService.userInfo.customerAccountID;
            }

            this.ticketRepository.get(accountID, this.ticketNumberParam)
                .then(data => {
                    if (!!data) {
                        this.ticket = data;
                        this.isTicketClosed = AppCommon.TicketUtils.isTicketClosed(this.ticket.TicketStatus);
                        this.isTicketActive = AppCommon.TicketUtils.isTicketActive(this.ticket.TicketStatus);
                        
                        this.loadingPromise = this.billingQuery.getById(this.ticket.ID);
                        this.loadingPromise.then((dataBilling: BillingQueryResult) => {
                            if (!!dataBilling) {
                                this.billing = dataBilling;
                            }
                        });
                    }
                });
        }

        goBack = (): void => {
            window.history.back();
        }
    }

    angular.module("app.customer")
        .controller("CustomerSingleTicketController",
        [
            "$stateParams", "AuthService", "SessionService", "CustomerTicketQuery", "BillingQuery",
            (stateParams, auth, sess, ticket, bq) => new CustomerSingleTicketController(stateParams, auth, sess, ticket, bq)
        ]);
}