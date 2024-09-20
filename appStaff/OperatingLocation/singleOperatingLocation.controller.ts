module AppStaff {

    export class SingleOperatingLocationController extends AppCommon.ControllerBase {
        operatingLocationIdParam: string;
        utils: AppCommon.GenericUtils;
        enumUtils: AppCommon.EnumUtils;
        operatingLocation: OperatingLocationDTO;
        calculationFormulaTypeList: Array<any>;
        isInEditMode: boolean;
        tab: number;

        static $inject = ["$state", "$stateParams", "AuthService", "SessionService", "OperatingLocationRepository"];

        constructor(
                    private $state: ng.ui.IStateService,
                    private $stateParams: ng.ui.IStateParamsService,
                    private authService: AppCommon.AuthService,
                    private sessionService: AppCommon.SessionService,
                    private operatingLocationRepository: AppCommon.OperatingLocationRepository) {

            super(authService);

            this.operatingLocationIdParam = this.$stateParams["operatingLocationId"];
            this.isInEditMode = true;
            this.tab = 1;
            this.operatingLocation = null;
            this.utils = AppCommon.GenericUtils;
            this.enumUtils = AppCommon.EnumUtils;
            this.calculationFormulaTypeList = AppCommon.EnumUtils.getTitlesAndValues(CalculationFormulaType);

            if (this.operatingLocationIdParam == null) {
                this.setupNewData();
                this.isInEditMode = false;
            }

        }

        setupNewData = (): void => {
            this.operatingLocation = new OperatingLocationDTO();
            this.operatingLocation.ID = AppCommon.GuidService.NewGuid();
            this.operatingLocation.CustomerCode = AppCommon.AppCommonConfig.operatingLocationCustomerCode;
            this.operatingLocation.FinancialConfiguration = new FinancialConfigurationDTO();
            this.operatingLocation.FinancialConfiguration.FeePercentage = 0;
            this.operatingLocation.FinancialConfiguration.TaxRatePercentage = 0;
            var newTieredRate = new TieredRateDTO();
            newTieredRate.HourStart = 0;
            newTieredRate.Rate = 0;
            this.operatingLocation.FinancialConfiguration.TieredRates = [newTieredRate];
            this.operatingLocation.AppSetting = new AppSettingDTO();
            this.operatingLocation.AppSetting.RequireCustomerName = false;
            this.operatingLocation.AppSetting.RequireVehicle = false;
            this.operatingLocation.AppSetting.RequireReturnFlight = false;
            this.operatingLocation.AppSetting.RequireReturnToCustomerDate = false;
            this.operatingLocation.AppSetting.RequireKeyTag = false;
            this.operatingLocation.LanguageSetting = new LanguageSettingDTO();
            this.operatingLocation.TimeIntervalSetting = new TimeIntervalSettingDTO();
        }

        onSave = (): void => {
            if (this.isInEditMode) {
                this.loadingPromise = this.operatingLocationRepository.update(this.operatingLocation, AppConfig.APIHOST);
            } else {
                this.loadingPromise = this.operatingLocationRepository.create(this.operatingLocation);
            }

            this.loadingPromise.then(() => {
                this.$state.go("setup-operatinglocations");
            });
        }

        onChangeFormula = (): void => {
            if (this.operatingLocation.FinancialConfiguration.CalculationFormulaType === CalculationFormulaType.DoNotProrate) {
                this.operatingLocation.FinancialConfiguration.ProrateDayBaseInHours = 0;
            }
        }

        onCancel(): void {
            this.$state.go("setup-operatinglocations");
        }

    }

    angular.module("app.staff")
        .controller("SingleOperatingLocationController",
        [
            "$state", "$stateParams", "AuthService", "SessionService", "OperatingLocationRepository",
            (state, stateParams, auth, sess, ol) => new SingleOperatingLocationController(state, stateParams, auth, sess, ol)
        ]);
}