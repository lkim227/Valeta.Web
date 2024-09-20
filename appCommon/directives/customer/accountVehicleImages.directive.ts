module AppCommon {

    export interface IAccountVehicleImagesAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IAccountVehicleImagesScope extends ng.IScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        accessLevel: AccessLevel;
        hasEditAccess: boolean;

        loadingPromise: ng.IPromise<any>;
        cgBusyConfiguration: any; 

        selectedTab: number;
        accountID: string;
        selectedVehicleId: string;
        vehicleTickets: Array<AirportTicketQueryResult>;
        accountVehicles: Array<VehicleDTO>;
        vehicleImages: Array<VehicleDamageCheckPhotoDTO>;
        vehicleDamages: Array<VehicleDamageMarkDTO>; 
        vehicleSignatures: Array<VehicleDamageSignatureDTO>; 

        retrieveImages(selectedTab: number): void;
        onChangeVehicle(selected: string): void;
        markDamageDiagram(data: VehicleDamageMarkDTO[]): void;
        cleanDamageDiagram(): void;
        openFullImage(title: string, imageUrl: string): void;
        getImageUrl(fileName: string): string;
    }

    class AccountVehicleImagesDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.accountVehicleImagesTemplateUrl;
        scope = {

        };

        static $inject = ["$state", "$stateParams", "$uibModal", "SessionService", "AuthService", "ReservationRepository", "VehicleRepository", "DispatcherAirportTicketQuery"];

        constructor(private $state: ng.ui.IStateService,
                    private $stateParams: ng.ui.IStateParamsService,
                    private $uibModal: angular.ui.bootstrap.IModalService,
                    private sessionService: AppCommon.SessionService,
                    private authService: AppCommon.AuthService,
                    private reservationRepository: ReservationRepository,
                    private vehicleRepository: VehicleRepository,
                    private ticketRepository: DispatcherAirportTicketQuery) {
        }

        link: ng.IDirectiveLinkFn = (
            scope: IAccountVehicleImagesScope,
            elements: ng.IAugmentedJQuery,
            attrs: IAccountVehicleImagesAttrs,
            ngModelCtrl: ng.INgModelController) => {

            var self = this;
            //scope.cgBusyConfiguration = { promise: scope.loadingPromise, message: "Loading Your Data" };
            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");
            var tabs = { 1: "front", 2: "right", 3: "back", 4: "left", 5: "damages" }

            scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.dispatch);
            scope.hasEditAccess = scope.accessLevel >= AccessLevel.Edit;

            scope.canCreate = getBooleanAttribute(attrs.canCreate) && scope.hasEditAccess;
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate);
            scope.canDelete = getBooleanAttribute(attrs.canDelete);

            scope.accountID = self.$stateParams["customerIdentifier"];
            scope.selectedVehicleId = null;
            scope.selectedTab = 1; // Front(1) - Right(2) - Back(3) - Left(4) - Damages(5)
            scope.vehicleImages = [];
            scope.vehicleDamages = [];
            scope.vehicleSignatures = [];
            var now = new Date();

            // get customer vehicles to populate select-dropdown
            self.vehicleRepository.getByAccountID(scope.accountID)
                .then(data => {
                    scope.accountVehicles = data;
                });

            scope.getImageUrl = (fileName: string) => {
                var imgUrl = "";
                if (scope.selectedTab < 5) { // FLRB
                    imgUrl = AppConfig.DamageCheckImageBaseUrl + fileName;
                } else if (scope.selectedTab === 5) { // DAMAGES
                    imgUrl = AppConfig.DamageMarkImageBaseUrl + fileName;
                }

                return imgUrl;
            }

            scope.onChangeVehicle = (selected: string) => {
                scope.selectedVehicleId = selected;
                scope.vehicleImages = [];
                scope.vehicleDamages = [];
                scope.vehicleSignatures = [];
                scope.cleanDamageDiagram();
                if (!!selected) {
                    scope.selectedVehicleId = selected;
                    scope.loadingPromise = self.ticketRepository.getByVehicleID(scope.selectedVehicleId);
                    scope.loadingPromise.then(data => {
                        scope.vehicleTickets = data;
                        scope.retrieveImages(scope.selectedTab);
                    });
                }
            }

            scope.$watch('selectedTab',
                function(newValue: number) {
                    if (newValue && !!scope.vehicleTickets) {
                        scope.vehicleImages = [];
                        scope.vehicleDamages = [];
                        scope.vehicleSignatures = [];
                        scope.cleanDamageDiagram();
                        scope.retrieveImages(newValue);
                    }
                });

            scope.retrieveImages = (selectedTab: number) => {
                if (selectedTab === 5) {
                    // DAMAGES                       
                    scope.vehicleTickets.forEach((ticket, index) => {
                        scope.loadingPromise = self.vehicleRepository.getDamagesByTicket(ticket.TicketNumber);
                        scope.loadingPromise.then((data: VehicleDamageMarkDTO[]) => {
                            if (!!data) {
                                scope.markDamageDiagram(data);
                                scope.vehicleDamages = scope.vehicleDamages.concat(data);
                            }
                        });
                    });
                } else if (selectedTab === 6) {
                    // DAMAGE SIGNATURES                    
                    scope.vehicleTickets.forEach((ticket, index) => {
                        scope.loadingPromise = self.vehicleRepository.getDamageSignatureByTicket(ticket.TicketNumber);
                        scope.loadingPromise.then((data: VehicleDamageSignatureDTO) => {
                            if (!!data) {
                                scope.vehicleSignatures = scope.vehicleSignatures.concat(data);
                            }
                        });
                    });
                } else {
                    // FLBR
                    scope.vehicleTickets.forEach((ticket, index) => {
                        scope.loadingPromise =
                            self.vehicleRepository.getImagesByTicketAndSide(ticket.TicketNumber, tabs[selectedTab])
                        scope.loadingPromise.then((data: VehicleDamageCheckPhotoDTO[]) => {
                            if (!!data)
                                scope.vehicleImages = scope.vehicleImages.concat(data);
                        });
                    });
                }
            }

            scope.markDamageDiagram = (data: VehicleDamageMarkDTO[]) => {
                // NOTE: The real diagram img (1184x760)=100%  was reduced to  (360x231)=31%
                const proportionalAspect = 0.31;
                data.forEach((mark, index) => {
                    const coordX =
                        (mark.DiagramLocationX * proportionalAspect) + 20 + "px"; // +20px -> width element offset
                    const coordY = (mark.DiagramLocationY * proportionalAspect) + "px";
                    let markElement = $('<img/>').attr("src", "/appCommon/resources/x.png").attr("alt", "");
                    markElement.attr("title", mark.Description);
                    markElement.attr("width", 20);
                    markElement.attr("class", "damage-mark");
                    markElement.css({ "position": "absolute", "top": coordY, "left": coordX, "cursor": "pointer" });
                    markElement.on("click",
                        (ev) => {
                            scope.openFullImage(mark.Description,
                                scope.getImageUrl(mark.LocalPhotoSet.FullsizeFileName));
                        });

                    $("#diagramImage").before(markElement); // insert on diagram
                });
            }

            scope.cleanDamageDiagram = () => {
                $(".damage-mark").remove();
            }

            scope.openFullImage = (title: string, imageUrl: string) => {
                var modalTitle = "Vehicle Image - (" + title + ")";
                var modalInstance: angular.ui.bootstrap.IModalServiceInstance = self.$uibModal.open({
                    animation: true,
                    templateUrl: "/appCommon/directives/imagePreview.modal.html",
                    controller: () => new ImagePreviewModalController(scope, modalInstance, modalTitle, imageUrl),
                    controllerAs: "modalVm",
                    resolve: {
                        modalTitle: () => modalTitle,
                        imageUrl: () => imageUrl
                    }
                });
            }

        }

    }

    angular.module("app.common")
        .directive("accountVehicleImages",
        ["$state", "$stateParams", "$uibModal", "SessionService", "AuthService", "ReservationRepository", "VehicleRepository", "DispatcherAirportTicketQuery",
            (state, params, modal, s, a, r, v, t) => new AccountVehicleImagesDirective(state, params, modal, s, a, r, v, t)]);
}