module AppCommon {

    export class ProfileImageCropperModalController extends AppCommon.ControllerBase {
        pageTitle: string;
        parentController: ProfileController;
        selectedImage: string;
        croppedImage: string;

        static $inject = ["$rootScope", "$scope", "$uibModalInstance", "AuthService", "ProfileImageService", "ErrorHandlingService", "image", "profile"];

        constructor(private $rootScope: any,
                    private $scope: any,
                    private $uibModalInstance: angular.ui.bootstrap.IModalServiceInstance,
                    private authService: AppCommon.AuthService,
                    private profileImageService: AppCommon.ProfileImageService,
                    private errorHandlingService: AppCommon.ErrorHandlingService,
                    public image: any,
                    public profile: string) {      

            super(authService);
            this.pageTitle = "Edit profile photo";
            this.selectedImage = image;
            this.croppedImage = "";
        }

        saveImage(): void {
            var resultFile = AppCommon.GenericUtils.getFileFromUri(this.croppedImage);

            if (this.profile == "customer") {
                this.profileImageService.uploadImage(resultFile, this.userInfo.customerAccountID, AppConfig.APIHOST, UserType.Customer);
            }
            else {
                var employeeId = this.profile.split('_')[1]; // sent from kendo grid
                this.profileImageService.uploadImage(resultFile, employeeId, AppConfig.APIHOST, UserType.Employee);
            }

            this.$uibModalInstance.close(true); 
        }

        cancel(): void {
            this.$uibModalInstance.dismiss("cancel");
        }

    }

    angular.module("app.common")
        .controller("ProfileImageCropperModalController",
        [
            "$rootScope", "$scope", "$uibModalInstance", "AuthService", "ProfileImageService", "ErrorHandlingService", "image", "profile",
            (root, scope, uibi, auth, piu, err, img, pType) => new ProfileImageCropperModalController(root, scope, uibi, auth, piu, err, img, pType)
        ]);
}