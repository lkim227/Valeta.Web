module AppStaff {

    export class StaffSingleTicketController extends AppCommon.ControllerBase {
        ticketNumberParam: string;
        ticket: AirportTicketQueryResult;
        billing: BillingQueryResult;
        utils: AppCommon.GenericUtils;
        flightUtils: AppCommon.FlightUtils;
        ticketUtils: AppCommon.TicketUtils;
        operatingLocation: OperatingLocationDTO;
        travelFromCustomer: TravelDirection;
        travelToCustomer: TravelDirection;
        isDeparture: boolean;
        isReturn: boolean;
        isTicketCannotClose: boolean;
        isTicketCancelled: boolean;
        isTicketOutgoing: boolean;

        currentCommunicationContext: string;
        currentObjectEvents: Array<any>;
        currentBillingEvents: Array<any>;
        notifyBillingSummary: boolean;
        isTicketClosed: boolean;
        isTicketActive: boolean;
        isTicketClosing: boolean;
        pageWillReload: boolean;
        hasUncompletedServices: boolean;
        uncompleteServiceTaskExplanation: string;

        static $inject = [
            "$state", "$stateParams", "AuthService", "SessionService", "DispatcherAirportTicketQuery", "TicketEvent",
            "ValetServiceCommand", "ReceiptQuery", "NotifyCustomerService", "BillingQuery", "BillingEvent", "ServiceTaskQuery"
        ];

        constructor(private $state: ng.ui.IStateService,
            private $stateParams: ng.ui.IStateParamsService,
            private authService: AppCommon.AuthService,
            private sessionService: AppCommon.SessionService,
            private ticketRepository: AppCommon.DispatcherAirportTicketQuery,
            private ticketEvent: TicketEvent,
            private valetServiceCommand: AppCommon.ValetServiceCommand,
            private receiptQuery: AppCommon.ReceiptQuery,
            private notifyCustomeService: AppCommon.NotifyCustomerService,
            private billingQuery: AppCommon.BillingQuery,
            private billingEvent: BillingEvent,
            private serviceTaskQuery: AppCommon.ServiceTaskQuery
        ) {

            super(authService);

            this.accessLevel = this.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.dispatch);
            this.hasEditAccess = this.accessLevel >= AccessLevel.Edit;

            this.ticketNumberParam = this.$stateParams["ticketNumber"];
            this.ticket = null;
            this.utils = AppCommon.GenericUtils;
            this.flightUtils = AppCommon.FlightUtils;
            this.ticketUtils = AppCommon.TicketUtils;
            this.travelFromCustomer = TravelDirection.FromCustomer;
            this.travelToCustomer = TravelDirection.ToCustomer;
            this.currentCommunicationContext = AppCommon.CommunicationUtils.referenceContextTicket;
            this.notifyBillingSummary = false;

            this.getTicket();
        }

        getTicket = (): void => {
            this.loadingPromise = this.ticketRepository.getByTicketNumber(this.ticketNumberParam);
            this.loadingPromise.then((data: AirportTicketQueryResult) => {
                if (!!data) {
                    this.ticket = data;
                    this.isDeparture = this.ticket.TravelDirection === TravelDirection.FromCustomer;
                    this.isReturn = this.ticket.TravelDirection === TravelDirection.ToCustomer;
                    this.isTicketClosed = AppCommon.TicketUtils.isTicketClosed(this.ticket.TicketStatus);
                    this.isTicketActive = AppCommon.TicketUtils.isTicketActive(this.ticket.TicketStatus);
                    this.isTicketClosing = AppCommon.TicketUtils.isTicketClosing(this.ticket.TicketStatus);
                    this.isTicketCannotClose = AppCommon.TicketUtils.isTicketCannotClose(this.ticket.TicketStatus);
                    this.isTicketCancelled = AppCommon.TicketUtils.isTicketCancelled(this.ticket.TicketStatus);
                    this.isTicketOutgoing = this.ticket.TicketStatus >= TicketStatus.Outgoing;
                    this.pageWillReload = false;

                    this.loadingPromise = this.ticketEvent.getByID(this.ticket.ID);
                    this.loadingPromise.then((dataEvents) => {
                        this.currentObjectEvents = AppCommon.EventUtils.parseEventsHtml(dataEvents);
                    });

                    //ask if we have uncompleted services
                    this.loadingPromise = this.serviceTaskQuery.getSummaryByTicketNumber(this.ticket.TicketNumber);
                    this.loadingPromise.then((serviceTaskSummary: ServiceTaskSummary) => {
                        this.hasUncompletedServices = serviceTaskSummary.NumberUncompletedServices > 0;
                    });

                    this.loadingPromise = this.billingQuery.getById(this.ticket.ID);
                    this.loadingPromise.then((dataBilling: BillingQueryResult) => {
                        if (!!dataBilling) {
                            this.billing = dataBilling;
                        }
                    });
                }
            });
        }
        regenerate = (): void => {
            var response = confirm("Are you sure you want to regenerate billing for this ticket?");
            if (response === false) {
                return;
            }

            this.pageWillReload = true;

            this.loadingPromise = this.billingQuery.regenerateBilling(this.ticket.ID);
            this.loadingPromise.then((result: string) => {
                if (!!result) {
                    this.$state.reload();
                }
            });
        }
        completeTicket = (): void => {
            var response = confirm("Are you sure you want to close this ticket?");
            if (response === false) {
                return;
            }

            this.pageWillReload = true;

            if (!!this.uncompleteServiceTaskExplanation && this.uncompleteServiceTaskExplanation.length > 0) {
                var command = new CloseAirportTicketWithUncompletedServicesCommandDTO();
                command.ID = this.ticket.ID;
                command.CreatedBy = this.userInfo.employeeFriendlyID;
                command.UncompleteServiceTaskExplanation = this.uncompleteServiceTaskExplanation;
                this.loadingPromise = this.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command);
            } else {
                var command2 = new CloseAirportTicketCommandDTO();
                command2.ID = this.ticket.ID;
                command2.CreatedBy = this.userInfo.employeeFriendlyID;
                command2.OfficeNote = this.ticket.OfficeNote;
                this.loadingPromise = this.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command2);
            }

            this.loadingPromise.then((success) => {
                if (success) {
                    this.$state.reload();
                }
            });
        }
        chargeTicket = (): void => {
            var response = confirm("Are you sure you want to charge this ticket?");
            if (response === false) {
                return;
            }

            this.pageWillReload = true;

            var command = new AttemptToProcessChargesCommandDTO();
            command.ID = this.ticket.ID;
            command.CreatedBy = this.userInfo.employeeFriendlyID;
            this.loadingPromise =
                this.valetServiceCommand.doCommand(CommonConfiguration_Routing.BillingCommandRoute, command);

            this.loadingPromise.then((success) => {
                if (success) {
                    this.$state.reload();
                }
            });
        }
        sendReceipt = (id: string): void => {
            this.pageWillReload = true;
            this.loadingPromise = this.receiptQuery.sendSavedReceipt(id);
            this.loadingPromise.then((success) => {
                if (success) {
                    this.$state.reload();
                }
            });
        }

        dispatchRequestReturnProcess = (dataItem: AirportTicketQueryResult) => {
            var response = confirm("Are you sure you want to give vehicle back to customer?");
            if (response === false) {
                return;
            }

            this.pageWillReload = true;
            var command = new DispatchRequestVehicleCommandDTO();
            command.ID = dataItem.ID;
            command.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;
            this.loadingPromise = this.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command);
            this.loadingPromise.then((success) => {
                if (success) {
                    this.$state.reload();
                }
            });
        };
        setAtBase = (dataItem: AirportTicketQueryResult) => {
            var response = confirm("Are you sure you want to change status to At Base?");
            if (response === false) {
                return;
            }
            this.changeTicketStatus(dataItem, TicketStatus.AtBase);
        };
        setCreated = (dataItem: AirportTicketQueryResult) => {
            var response = confirm("Are you sure you want to change status to Created?");
            if (response === false) {
                return;
            }
            this.changeTicketStatus(dataItem, TicketStatus.Created);
        };
        changeTicketStatus = (dataItem: AirportTicketQueryResult, newTicketStatus: TicketStatus) => {
            this.pageWillReload = true;
            var command = new ChangeTicketStatusCommandDTO();
            command.ID = dataItem.ID;
            command.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;
            command.NewStatus = newTicketStatus;
            this.loadingPromise = this.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command);
            this.loadingPromise.then((success) => {
                if (success) {
                    this.$state.reload();
                }
            });
        };

        viewBillingEvents = () => {
            this.loadingPromise = this.billingEvent.getByID(this.ticket.ID);
            this.loadingPromise.then((dataEvents) => {
                this.currentBillingEvents = AppCommon.EventUtils.parseEventsHtml(dataEvents);
            });
        };

        notifyCustomerOfGiveBackZone = () => {
            var response = confirm("Are you sure you want to notify customer of a Give Back zone change?");
            if (response === false) {
                return;
            }

            this.pageWillReload = true;
            this.loadingPromise = this.notifyCustomeService.notifyCustomerOfGiveBackZone(this.ticket.ID);
            this.loadingPromise.then((success) => {
                if (success) {
                    this.$state.reload();
                }
            });
        }
        notifyCustomerOfIntakeZone = () => {
            var response = confirm("Are you sure you want to notify customer of a Intake zone change?");
            if (response === false) {
                return;
            }

            this.pageWillReload = true;
            this.loadingPromise = this.notifyCustomeService.notifyCustomerOfIntakeZone(this.ticket.ID);
            this.loadingPromise.then((success) => {
                if (success) {
                    this.$state.reload();
                }
            });
        }

        needsManagerAttention = () => {
            this.pageWillReload = true;
            var command = new RequestManagerAttentionCommandDTO();
            command.ID = this.ticket.ID;
            command.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;
            this.loadingPromise = this.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command);
            this.loadingPromise.then((success) => {
                if (success) {
                    this.$state.reload();
                }
            });
        }

        removeManagerAttention = () => {
            this.pageWillReload = true;
            var command = new RemoveManagerAttentionCommandDTO();
            command.ID = this.ticket.ID;
            command.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;
            this.loadingPromise = this.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command);
            this.loadingPromise.then((success) => {
                if (success) {
                    this.$state.reload();
                }
            });
        }
        markNoShow = () => {
            var response = confirm("Are you sure you want to mark No Show?");
            if (response === false) {
                return;
            }

            this.pageWillReload = true;
            var command = new MarkNoShowCommandDTO();
            command.ID = this.ticket.ID;
            command.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;
            this.loadingPromise = this.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command);
            this.loadingPromise.then((success) => {
                if (success) {
                    this.$state.reload();
                }
            });
        }
        cancel = () => {
            var response = confirm("Are you sure you want to cancel this ticket?");
            if (response === false) {
                return;
            }
            var command = new CancelTicketCommandDTO();
            command.ID = this.ticket.ID;
            command.CreatedBy = this.sessionService.userInfo.employeeFriendlyID;
            this.loadingPromise = this.valetServiceCommand.doCommand(ValetConfiguration_Routing.AirportTicketCommandRoute, command);
            this.loadingPromise.then((success) => {
                if (success) {
                    this.$state.reload();
                }
            });
        }

        toggleInfo = (index: number): void => {
            var event = this.currentObjectEvents[index];

            // toggle event content 
            if (event.display)
                $($('.formatted-object')[index]).css({ "height": "32px", "overflow-y": "hidden" });
            else
                $($('.formatted-object')[index]).css({ "height": "auto", "overflow-y": "visible" });

            event.display = !event.display;
        }

    }

    angular.module("app.staff")
        .controller("StaffSingleTicketController",
            [
                "$state", "$stateParams", "AuthService", "SessionService", "DispatcherAirportTicketQuery",
                "TicketEvent", "ValetServiceCommand", "ReceiptQuery", "NotifyCustomerService", "BillingQuery", "BillingEvent", "ServiceTaskQuery",
                (state, stateParams, auth, sess, ticket, te, vsc, b, n, bq, be, stq) =>
                    new StaffSingleTicketController(state, stateParams, auth, sess, ticket, te, vsc, b, n, bq, be, stq)
            ]);
}