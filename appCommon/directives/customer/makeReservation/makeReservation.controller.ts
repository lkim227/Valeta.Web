module AppCommon {
    export class MakeReservationController extends AppCommon.ControllerBase {
        pageTitle: string;
        customerAccountUiRouting: AppCommon.CustomerAccountUiRouting;
        reservation: ReservationDTO;
        billing: BillingQueryResult;
        reservationAndBilling: ReservationAndBilling;
        paymentMethods: Array<PaymentMethodDTO>;
        authorizationErrorMessage: string;

        selectedLocation: OperatingLocationDTO;
        HasSelectedLocation: boolean;

        initialMaxDailyRate: number;
        customerHasPaymentMethods: boolean;
        selectedPaymentMethod: PaymentMethodDTO;
        parkingDays: number;
        availableServices: Array<OfferedServiceDTO>;
        availableServicesForThisReservation: any[];

        multiStepFormSteps: any;
        isContinuingPreviousIncompleteReservation: boolean;
        isEstimateGenerated: boolean;
        isEstimateFailed: boolean;
        isSubmitReservationRequested: boolean;
        showAdditionalServices: boolean;
        showRewards: boolean;
        showSplitPayment: boolean;
        haveUpdatedBilling: boolean;

        CCEmailsPattern: any = /^(([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}){1,25})+([;.](([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}){1,25})+)*$/;
        isCCEmailsValid: boolean;

        creatorName: string;
        accountID: string;
        account: AccountDTO;
        systemUserType: SystemUserType;
        uiNow: Date;

        splitPaymentFormIsValid: boolean;
        
        static $inject = [
            "$window", "$state", "$stateParams", "$scope", "KendoDataSourceService", "AuthService", "ErrorHandlingService", "ValetServiceCommand", "ServiceTaskCommand",
            "ReservationRepository", "PaymentMethodRepository", "ReservationStatusChangeService", "PointsAccountingRepository", "AccountRepository",
            "VehicleRepository", "OfferedServiceRepository", "BillingQuery", "SplitPaymentQuery"
        ];

        constructor(
            private $window: Window,
            private $state: ng.ui.IStateService,
            private $stateParams: ng.ui.IStateParamsService,
            private $scope: any,
            private kendoDataSourceService: AppCommon.KendoDataSourceService,
            private authService: AppCommon.AuthService,
            private errorHandlingService: AppCommon.ErrorHandlingService,
            private valetServiceCommand: AppCommon.ValetServiceCommand,
            private ServiceTaskCommand: AppCommon.ServiceTaskCommand,
            private reservationRepository: AppCommon.ReservationRepository,
            private paymentMethodRepository: AppCommon.PaymentMethodRepository,
            private reservationStatusChangeService: AppCommon.ReservationStatusChangeService,
            private pointsAccountingRepository: AppCommon.PointsAccountingRepository,
            private accountRepository: AppCommon.AccountRepository,
            private vehicleRepository: AppCommon.VehicleRepository,
            private offeredServiceRepository: AppCommon.OfferedServiceRepository,
            private billingQuery: AppCommon.BillingQuery,
            private splitPaymentQuery: AppCommon.SplitPaymentQuery
        ) {
            super(authService);

            this.pageTitle = $state.current.data.PageTitle;
            this.customerAccountUiRouting = $state.current.data.CustomerAccountUiRouting;

            if (_.includes(this.userInfo.userRoles, "Employee")) {
                // probably is some staff user
                this.accountID = this.$stateParams["customerIdentifier"];
                this.systemUserType = SystemUserType.Office;
                this.creatorName = this.userInfo.employeeFriendlyID;
            }
            else {
                // otherwise is customer logged on account
                this.accountID = this.userInfo.customerAccountID;
                this.systemUserType = SystemUserType.Customer;
                this.creatorName = "Customer";
            }

            this.showSplitPayment = false;
            this.HasSelectedLocation = false;
            this.isCCEmailsValid = true;

            this.initializeStep1();
        }

        private initializeStep1() {
            this.errorHandlingService.removePageErrors();
            this.loadingPromise = this.accountRepository.getByID(this.accountID, AppConfig.APIHOST);
            this.loadingPromise.then((data) => {
                this.account = data;

                this.initializeNewReservation();

                if (!!this.$window.localStorage) {
                    const incompleteID = this.$window.localStorage.getItem("incompleteReservationID");
                    const incompleteCustomerID = this.$window.localStorage.getItem("incompleteReservationCustomerID");
                    if (!!incompleteID && !!incompleteCustomerID && incompleteCustomerID === this.accountID) {
                        this.getReservationFromID(incompleteID)
                            .then(success => {
                                if (!success) {
                                    this.startOver();
                                } else {
                                    this.initializePaymentMethods();
                                    if (!!this.billing && !!this.billing.ReservationAllowanceOrder && !!this.billing.ReservationAllowanceOrder.ID) {
                                        this.showSplitPayment = true;
                                    }
                                }
                            });
                    }
                    else {
                        this.initializePaymentMethods();
                        if (!!this.billing && !!this.billing.ReservationAllowanceOrder && !!this.billing.ReservationAllowanceOrder.ID) {
                            this.showSplitPayment = true;
                        }
                    }
                } else {
                    this.initializePaymentMethods();
                    if (!!this.billing && !!this.billing.ReservationAllowanceOrder && !!this.billing.ReservationAllowanceOrder.ID) {
                        this.showSplitPayment = true;
                    }
                }
            });

            this.multiStepFormSteps = [
                { templateUrl: AppCommonConfig.makeReservationWizardStep1Url },
                { templateUrl: AppCommonConfig.makeReservationWizardStep2Url },
                { templateUrl: AppCommonConfig.makeReservationWizardStep3Url },
                { templateUrl: AppCommonConfig.makeReservationWizardStep4Url }
            ];
        }

        private initializeStep2() {
            this.errorHandlingService.removePageErrors();
            this.showAdditionalServices = false;
            this.haveUpdatedBilling = false;
            this.accountRepository.update(this.account, AppConfig.APIHOST)
                .then((result) => {
                    this.saveReservationFromStep1();
                });
        }

        private initializeStep3() {
            this.errorHandlingService.removePageErrors();
            this.haveUpdatedBilling = false;
            this.saveReservationFromStep2();

            if (!!this.billing.ReservationAllowanceOrder && !!this.billing.ReservationAllowanceOrder.ID) {
                this.showSplitPayment = true;
            }
        }

        private initializePaymentMethods() {
            var paymentMethodDataSource = this.kendoDataSourceService.getDataSource(CommonConfiguration_Routing.PaymentMethodRoute, CommonConfiguration_Routing_PaymentMethodMethods.GetByAccountID, this.accountID);
            paymentMethodDataSource.fetch(() => {
                this.paymentMethods = paymentMethodDataSource.data().toJSON();
                if (!!this.paymentMethods && this.paymentMethods.length > 0) this.customerHasPaymentMethods = true;
                //this.$scope.$digest();
            });
        }

        private initializeAvailableServices() {
            this.parkingDays = 0;

            if (!!this.reservation &&
                !!this.reservation.ReservedAirportMeet.IntakeSpecifications.DateUsedToCalculateMeetTime &&
                !!this.reservation.ReservedAirportMeet.GiveBackSpecifications.DateUsedToCalculateMeetTime) {
                this.reservationRepository.getParkingDays(
                    this.reservation.ReservedAirportMeet.IntakeSpecifications.DateUsedToCalculateMeetTime,
                    this.reservation.ReservedAirportMeet.GiveBackSpecifications.DateUsedToCalculateMeetTime,
                    this.reservation.OperatingLocationID)
                    .then((result) => {
                        this.parkingDays = result;

                        if (this.systemUserType === SystemUserType.Office) {

                            this.offeredServiceRepository
                                .getAvailableOfferedServices(this.parkingDays, this.reservation.Vehicle.Make)
                                .then((data) => {
                                    this.initializeOfferedServices(data);
                                });

                        } else {
                            //customer
                            this.offeredServiceRepository
                                .getAvailableOfferedServicesForCustomer(this.parkingDays, this.reservation.Vehicle.Make)
                                .then((data) => {
                                    this.initializeOfferedServices(data);
                                });
                        }
                    });
            }
        }

        private initializeOfferedServices(data: OfferedServiceDTO[]) {
            this.availableServices = data;

            this.availableServicesForThisReservation = this.availableServices;

            this.availableServicesForThisReservation.forEach(
                service => service.userSelectedThis = false);

            if (!!this.billing &&
                !!this.billing.ReservationCatchAllOrder &&
                !!this.billing.ReservationCatchAllOrder.ReservedServices) {

                // Process CatchAll services (in reverse order in case any are removed)
                for (let reservedIndex =
                    this.billing.ReservationCatchAllOrder.ReservedServices.length - 1;
                    reservedIndex >= 0;
                    reservedIndex--) {

                    const serviceIndex = IESafeUtils.arrayFindIndex(
                        this.availableServicesForThisReservation,
                        service => service.ID ===
                            this.billing.ReservationCatchAllOrder.ReservedServices[reservedIndex]
                                .OfferedServiceID,
                        this);

                    if (!angular.isUndefined(serviceIndex) &&
                        serviceIndex >= 0 &&
                        this.availableServicesForThisReservation[serviceIndex].IsActive) {

                        this.availableServicesForThisReservation[serviceIndex]
                            .userSelectedThis = true;

                    } else if (angular.isUndefined(serviceIndex) ||
                        serviceIndex < 0 ||
                        !this.availableServicesForThisReservation[serviceIndex].IsActive) {

                        this.billing.ReservationCatchAllOrder.ReservedServices
                            .splice(reservedIndex, 1);
                    };
                }
            }

            if (!!this.billing &&
                !!this.billing.ReservationAllowanceOrder &&
                !!this.billing.ReservationAllowanceOrder.ReservedServices) {
                // Process Allowance services (in reverse order in case any are removed)
                for (let reservedIndex =
                    this.billing.ReservationAllowanceOrder.ReservedServices.length - 1;
                    reservedIndex >= 0;
                    reservedIndex--) {

                    const serviceIndex = IESafeUtils.arrayFindIndex(
                        this.availableServicesForThisReservation,
                        service => service.ID ===
                            this.billing.ReservationAllowanceOrder.ReservedServices[reservedIndex]
                                .OfferedServiceID,
                        this);

                    if (!angular.isUndefined(serviceIndex) &&
                        serviceIndex >= 0 &&
                        this.availableServicesForThisReservation[serviceIndex].IsActive) {

                        this.availableServicesForThisReservation[serviceIndex]
                            .userSelectedThis = true;

                    } else if (angular.isUndefined(serviceIndex) ||
                        serviceIndex < 0 ||
                        !this.availableServicesForThisReservation[serviceIndex].IsActive) {

                        this.billing.ReservationAllowanceOrder.ReservedServices
                            .splice(reservedIndex, 1);
                    };
                }
            }

            this.showAdditionalServices = true;
        }

        private initializeNewReservation() {
            this.reservation = new ReservationDTO();
            this.reservation.Status = ReservationStatus.Unfinished;
            this.reservation.AccountID = this.accountID;
            this.reservation.CreatedBy = this.creatorName; // Office OR Customer
            this.reservation.OperatingLocationID = this.account.DefaultOperatingLocationID;
            this.reservation.ReservedAirportMeet = new ReservedAirportMeetDTO();
            this.reservation.ReservedAirportMeet.IntakeSpecifications = new FlightSpecificationsDTO();
            this.reservation.ReservedAirportMeet.IntakeSpecifications.FlightDirection = FlightDirection.Departure;
            this.reservation.ReservedAirportMeet.GiveBackSpecifications = new FlightSpecificationsDTO();
            this.reservation.ReservedAirportMeet.GiveBackSpecifications.FlightDirection = FlightDirection.Return;
            this.reservation.ReservedAirportMeet.IntakeSchedule = new ScheduleDTO();
            this.reservation.ReservedAirportMeet.GiveBackSchedule = new ScheduleDTO();
            this.reservation.CCEmails = this.account.CCEmails;
            this.reservation.Note = this.account.NoteToValets;
            this.reservation.ReservedAirportMeet.IntakeRelativeMeetLocation = this.account.DefaultMeetLocationIntake;

            this.billing = new BillingQueryResult(); //proper object is created in API
            this.billing.ReservationCatchAllOrder = new ReservationCatchAllOrderDTO();
            this.billing.ReservationCatchAllOrder.TipBreakdown = [];
            this.billing.ReservationCatchAllOrder.TipBreakdown[0] = new TipDTO();
            this.billing.ReservedPromotionDiscounts = [];
            this.billing.CartOfRewards = [];
            this.billing.ReservationAllowanceOrder = null;

            this.isContinuingPreviousIncompleteReservation = false;

            this.showAdditionalServices = false;
            this.showRewards = false;
        }

        private hasVehicleAndFlights() {
            return (!!this.reservation.Vehicle
                && !!this.reservation.ReservedAirportMeet.IntakeSpecifications.FlightNumber
                && this.reservation.ReservedAirportMeet.IntakeSpecifications.FlightNumber.length > 0
                && (this.reservation.ReservedAirportMeet.IntakeSpecifications.FlightNumber === "0000"
                    || (this.reservation.ReservedAirportMeet.IntakeSchedule.ScheduleDateTime
                        && this.reservation.ReservedAirportMeet.IntakeSchedule.ScheduleDateTime.length > 0))
                && !!this.reservation.ReservedAirportMeet.GiveBackSpecifications.FlightNumber
                && this.reservation.ReservedAirportMeet.GiveBackSpecifications.FlightNumber.length > 0
                && (this.reservation.ReservedAirportMeet.GiveBackSpecifications.FlightNumber === "0000"
                || (this.reservation.ReservedAirportMeet.GiveBackSchedule.ScheduleDateTime
                && this.reservation.ReservedAirportMeet.GiveBackSchedule.ScheduleDateTime.length > 0)));
        }

        private startOver() {
            if (!!this.$window.localStorage) {
                this.$window.localStorage.removeItem("incompleteReservationID");
                this.$window.localStorage.removeItem("incompleteReservationCustomerID");
            }
            this.$state.go(this.$state.current, {}, { reload: true });
        }

        private updateOperatingLocation(newOperatingLocation: OperatingLocationDTO): void {
            this.selectedLocation = newOperatingLocation;
            if (!this.selectedLocation || this.selectedLocation == null || angular.isUndefined(this.selectedLocation)) {
                // intentionally not changing account default if no operating location is selected
                this.reservation.OperatingLocationID = null;
                this.billing.FinancialConfiguration = null;
                this.reservation.ReservedAirportMeet.IntakeSpecifications.AirportCode = null;
                this.reservation.ReservedAirportMeet.GiveBackSpecifications.AirportCode = null;
                this.HasSelectedLocation = false;
            }
            else {
                this.account.DefaultOperatingLocationID = this.selectedLocation.ID;
                this.reservation.OperatingLocationID = this.selectedLocation.ID;
                this.billing.OperatingLocationID = this.selectedLocation.ID;
                this.billing.FinancialConfiguration = this.selectedLocation.FinancialConfiguration;
                this.reservation.ReservedAirportMeet.IntakeSpecifications.AirportCode = this.selectedLocation.AirportCode;
                this.reservation.ReservedAirportMeet.GiveBackSpecifications.AirportCode = this.selectedLocation.AirportCode;
                this.HasSelectedLocation = true;
            }
        }

        private availableServiceChecked(service) {
            if (!service.IsActive) {
                // Disallow checking inactive services
                $(`#${service.ID}`).prop("checked", false);
                return;
            };

            if (service.userSelectedThis === false) {
                //de-selected, remove from orders
                let foundIndex: number;

                if (!!this.billing.ReservationCatchAllOrder && !!this.billing.ReservationCatchAllOrder.ReservedServices) {
                    foundIndex = IESafeUtils.arrayFindIndex(this.billing.ReservationCatchAllOrder.ReservedServices, r => r.OfferedServiceID === service.ID, this);
                    if (foundIndex >= 0) {
                        this.billing.ReservationCatchAllOrder.ReservedServices.splice(foundIndex, 1);
                    }
                }

                if (!!this.billing.ReservationAllowanceOrder && !!this.billing.ReservationAllowanceOrder.ReservedServices) {
                    foundIndex = IESafeUtils.arrayFindIndex(this.billing.ReservationAllowanceOrder.ReservedServices, r => r.OfferedServiceID === service.ID, this);
                    if (foundIndex >= 0) {
                        this.billing.ReservationAllowanceOrder.ReservedServices.splice(foundIndex, 1);
                    }
                }

            } else {
                //selected, add to catch all
                const newService = new ReservedServiceDTO();
                newService.ServiceTaskID = AppCommon.GuidService.NewGuid();
                newService.OfferedServiceID = service.ID;
                newService.ServiceFee = service.ServiceFee;
                newService.TaxRate = service.TaxRate;
                newService.Category = service.Category;
                newService.ServiceName = service.ServiceName;
                newService.ProviderCharge = service.ProviderCharge;

                if (!this.billing.ReservationCatchAllOrder.ReservedServices) {
                    this.billing.ReservationCatchAllOrder.ReservedServices = new Array<ReservedServiceDTO>();
                }

                this.billing.ReservationCatchAllOrder.ReservedServices.push(newService);
            }
        }

        private splitPayment() {

            // Tip directive can create empty ReservationAllowanceOrder, so check for ID as well as object
            //if (!this.billing.ReservationAllowanceOrder || GenericUtils.isUndefinedOrNull(this.billing.ReservationAllowanceOrder.ID)) {

            if (!!this.paymentMethods && this.paymentMethods.length > 1) {
                this.splitPaymentQuery.initialize(this.billing.ID)
                    .then((data) => {
                        this.billing = data;

                        this.initialMaxDailyRate = this.billing.ReservationAllowanceOrder.ParkingDayRateAllowance;
                    }); 

                //initialize isValid
                this.showSplitPayment = true;
                this.splitPaymentFormIsValid = false;

            } else {
                alert("Please add another payment method to your account profile in order to split the payment.");
            }
        }
        
        private preselectPaymentMethodIfApplicable() {
            if (!!this.paymentMethods && this.paymentMethods.length === 1
                && !!this.billing && !!this.billing.ReservationCatchAllOrder
                && GenericUtils.isUndefinedNullOrEmpty(this.billing.ReservationCatchAllOrder.PaymentMethodID)) {

                this.billing.ReservationCatchAllOrder.PaymentMethodID = this.paymentMethods[0].ID;
            }
        }
        private getBilling(reservationId: string) {
            this.billingQuery.getById(reservationId).then((data) => {
                if (!!data) {
                    this.billing = data;
                    if (this.billing.CartOfRewards == null) this.billing.CartOfRewards = [];
                    var reservedRewards = this.billing.CartOfRewards.filter(r => r.QuantityReserved > 0);
                    if (reservedRewards.length > 0) this.showRewards = true;
                    this.preselectPaymentMethodIfApplicable();
                    this.haveUpdatedBilling = true;
                    this.initializeAvailableServices();
                }
            });
        }
        private getReservationFromID(reservationID: string): ng.IPromise<boolean> {
            return this.reservationRepository.getByID(reservationID, AppConfig.APIHOST)
                .then((result) => {
                    if (!!result &&
                        !!result.ReservationNumber &&
                        result.ReservationNumber > 0 &&
                        result.Status === ReservationStatus.Unfinished) {
                        this.reservation = result;
                        this.isContinuingPreviousIncompleteReservation = true;

                        this.getBilling(this.reservation.ID.toString());
                    } else {
                        this.errorHandlingService.removePageErrors();
                        return false;
                    }
                    return true;
                })
                .catch(() => {
                    return false;
                });
        }


        private cleanupReservationArtifacts(): void {
            if (!!this.billing.ReservationAllowanceOrder && !!this.billing.ReservationAllowanceOrder.ID) {
                this.billing.ReservationAllowanceOrder = null;
            }
        }
        private isReservationValid(): boolean {
            if (this.billing.FinancialConfiguration === null ||
                this.reservation.OperatingLocationID === null)
                return false;
            return true;
        }

        private createReservation(): void {
            this.reservationAndBilling = new ReservationAndBilling();
            if (typeof this.reservation.ReservedAirportMeet.IntakeSchedule.ScheduleDateTime == "undefined" ||
                this.reservation.ReservedAirportMeet.IntakeSchedule.ScheduleDateTime === null ||
                this.reservation.ReservedAirportMeet.IntakeSchedule.ScheduleDateTime.length < 1 ||
                IESafeUtils.stringStartsWith(this.reservation.ReservedAirportMeet.IntakeSchedule.ScheduleDateTime, "1/1/001")) {
                this.reservation.ReservedAirportMeet.IntakeSchedule.ScheduleDateTime = this.reservation.ReservedAirportMeet.IntakeSpecifications.DateUsedToCalculateMeetTime;
            }
            if (typeof this.reservation.ReservedAirportMeet.GiveBackSchedule.ScheduleDateTime == "undefined" ||
                this.reservation.ReservedAirportMeet.GiveBackSchedule.ScheduleDateTime === null ||
                this.reservation.ReservedAirportMeet.GiveBackSchedule.ScheduleDateTime.length < 1 ||
                IESafeUtils.stringStartsWith(this.reservation.ReservedAirportMeet.GiveBackSchedule.ScheduleDateTime, "1/1/001")) {
                this.reservation.ReservedAirportMeet.GiveBackSchedule.ScheduleDateTime = this.reservation.ReservedAirportMeet.GiveBackSpecifications.DateUsedToCalculateMeetTime;
            }
            this.reservationAndBilling.Reservation = this.reservation;

            this.billing.FinancialConfiguration = this.selectedLocation.FinancialConfiguration;
            this.reservationAndBilling.Billing = this.billing;

            this.reservationRepository.createReservationAndBilling(this.reservationAndBilling)
                .then((success) => {
                    if (success) {
                        if (!!this.$window.localStorage) {
                            this.$window.localStorage.setItem("incompleteReservationID", this.reservation.ID);
                            this.$window.localStorage.setItem("incompleteReservationCustomerID", this.accountID);
                        }
                        //read again, because backend generates data
                        this.getReservationFromID(this.reservation.ID);
                        this.reservation.ReservationNumber = this.reservation.ReservationNumber;
                    }
                },
                (ex: any) => {
                    this.errorHandlingService.showPageError(ex.data.ExceptionMessage);
                });
        }
        private updateReservationFromStep1(): void {
            this.reservationAndBilling = new ReservationAndBilling();
            this.reservationAndBilling.Reservation = this.reservation;
            this.reservationAndBilling.Billing = this.billing;

            this.reservationRepository.updateReservationAndBilling(this.reservationAndBilling)
                .then(() => {
                        console.log("Reservation and billing are updated");
                        this.getReservationFromID(this.reservation.ID);
                    },
                    (ex: any) => {
                        this.errorHandlingService.showPageError(ex.data.ExceptionMessage);
                    });
        }
        saveReservationFromStep1(): void {
            this.cleanupReservationArtifacts();

            if (this.isReservationValid()) {
                this.errorHandlingService.removePageErrors();

                if (this.reservation.ID) {
                    this.updateReservationFromStep1();
                } else {
                    this.reservation.ID = AppCommon.GuidService.NewGuid();
                    this.reservation.SystemUserType = this.systemUserType;
                    this.createReservation();
                }
            }
        }
        
        private updateReservationFromStep2(): void {
            this.reservationAndBilling = new ReservationAndBilling();
            this.reservationAndBilling.Reservation = this.reservation;
            this.reservationAndBilling.Billing = this.billing;

            this.reservationRepository.updateReservationAndBilling(this.reservationAndBilling)
                .then(() => {
                    console.log("Reservation and billing are updated");
                    this.getReservationFromID(this.reservation.ID);
                },
                (ex: any) => {
                    this.errorHandlingService.showPageError(ex.data.ExceptionMessage);
                });
        }
        saveReservationFromStep2(): void {
            this.isSubmitReservationRequested = false;
            if (this.isReservationValid()) {
                this.errorHandlingService.removePageErrors();

                if (this.reservation.ID) {
                    this.updateReservationFromStep2();
                }
            }
        }
        
        private updateReservationFromStep3(): void {
            this.reservationAndBilling = new ReservationAndBilling();
            this.reservationAndBilling.Reservation = this.reservation;
            this.reservationAndBilling.Billing = this.billing;

            this.reservationRepository.updateReservationAndBilling(this.reservationAndBilling)
                .then(() => {
                    console.log("Reservation and billing are updated");
                    this.getReservationFromID(this.reservation.ID);
                },
                (ex: any) => {
                    this.errorHandlingService.showPageError(ex.data.ExceptionMessage);
                });
        }
        saveReservationFromStep3(): void {
            this.isSubmitReservationRequested = false;
            if (this.isReservationValid()) {
                this.errorHandlingService.removePageErrors();

                if (this.reservation.ID) {
                    this.updateReservationFromStep3();
                }
            }
        }

        cancelReservationUpdate(ndx: number): void {
            this.$state.go("reservations");
        }

        finalizeReservation(): void {
            this.isSubmitReservationRequested = true;
            this.isCCEmailsValid = !!this.reservation.CCEmails && this.CCEmailsPattern.test(this.reservation.CCEmails);

            var allowToPlaceReservation = true;
            this.authorizationErrorMessage = "";

            this.reservationRepository.authorizeAndUpdateReservationAndBilling(this.reservationAndBilling)
                .then((authorizationErrorMessage) => {
                        if (!!authorizationErrorMessage && authorizationErrorMessage.length > 0) {
                            this.authorizationErrorMessage = authorizationErrorMessage;
                        } else {
                            this.reservationStatusChangeService
                                .changeReservationStatus(this.reservation.ID, ReservationStatus.Pending)
                                .then((success) => {
                                    if (success) {
                                        if (!!this.$window.localStorage) {
                                            this.$window.localStorage.removeItem("incompleteReservationID");
                                            this.$window.localStorage.removeItem("incompleteReservationCustomerID");
                                        }
                                        if (this.customerAccountUiRouting.appendCustomerIdentifier) {
                                            this.$state.go(this.customerAccountUiRouting.thankYouReservationUiRoute,
                                                {
                                                    "reservationID": this.reservation.ID,
                                                    "customerIdentifier": this.accountID
                                                });
                                        } else {
                                            this.$state.go(this.customerAccountUiRouting.thankYouReservationUiRoute,
                                                { "reservationID": this.reservation.ID });
                                        }
                                    }
                                });
                        }
                    },
                    (ex: any) => {
                        this.errorHandlingService.showPageError(ex.data.ExceptionMessage);
                    });

        }
    }

    angular.module("app.common")
        .controller("MakeReservationController",
        [
            "$window", "$state", "$stateParams", "$scope", "KendoDataSourceService", "AuthService", "ErrorHandlingService", "ValetServiceCommand", "ServiceTaskCommand",
            "ReservationRepository", "PaymentMethodRepository", "ReservationStatusChangeService", "PointsAccountingRepository", "AccountRepository",
            "VehicleRepository", "OfferedServiceRepository", "BillingQuery", "SplitPaymentQuery",
            (win, state, params, scope, kendods, auth, errSvc, vsc, astc, resRepo, pmRepo, resStatus, paRepo, acRepo, vRepo, aRepo, bq, split) =>
                new MakeReservationController(win, state, params, scope, kendods, auth, errSvc, vsc, astc, resRepo, pmRepo, resStatus, paRepo, acRepo, vRepo, aRepo, bq, split)
        ]);
}