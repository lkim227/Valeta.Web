module AppCommon {

    export class ImagePreviewModalController {
        pageTitle: string;
        selectedImageUrl: string;

        static $inject = ["$scope", "$uibModalInstance", "modalTitle", "imageUrl"];

        constructor(private $scope: any,
                    private $uibModalInstance: angular.ui.bootstrap.IModalServiceInstance,
                    public modalTitle: string,
                    public imageUrl: any) {
            this.pageTitle = modalTitle;
            this.selectedImageUrl = imageUrl;
        }

        cancel(): void {
            this.$uibModalInstance.dismiss("cancel");
        }

    }

    angular.module("app.common")
        .controller("ImagePreviewModalController",
        [
            "$scope", "$uibModalInstance", "modalTitle", "imageUrl",
            (scope, modal, title, img) => new ImagePreviewModalController(scope, modal, title, img)
        ]);
}