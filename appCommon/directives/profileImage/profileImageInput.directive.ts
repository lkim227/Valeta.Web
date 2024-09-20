module AppCommon {
    import utils = AppCommon.GenericUtils;

    export interface IProfileImageInputAttributes extends ng.IAttributes {
        accountId: string;
        profileType: string;
    }

    export interface IProfileImageInputScope extends ng.IScope {
        directiveInitialized: boolean;
        profileImageInput: File;
        profileImagePreview: string;

        onShowModal: (img: any, pType: string) => void;
    }


    class ProfileImageInputDirective implements ng.IDirective {
        restrict = "A";

        scope = {
            profileImageInput: "=",
            profileImagePreview: "="
        };

        static $inject = ["$rootScope", "$state", "$uibModal", "AuthService", "ProfileImageService", "ErrorHandlingService"];

        constructor(private $rootScope: any,
                    private $state: ng.ui.IStateService,
                    private $uibModal: angular.ui.bootstrap.IModalService,
                    private authService: AppCommon.AuthService,
                    private profileImageService: AppCommon.ProfileImageService,
                    private errorHandlingService: AppCommon.ErrorHandlingService) {
        }

        static instance($rootScope: any,
                        $state: ng.ui.IStateService,
                        $uibModal: angular.ui.bootstrap.IModalService,
                        authService: AppCommon.AuthService,
                        profileImageService: AppCommon.ProfileImageService,
                        errorHandlingService: AppCommon.ErrorHandlingService): ng.IDirectiveFactory {
            var directive: ng.IDirectiveFactory = () => new ProfileImageInputDirective($rootScope, $state, $uibModal, authService, profileImageService, errorHandlingService);
            return directive;
        }

        link: ng.IDirectiveLinkFn = (scope: IProfileImageInputScope, elements: any, attrs: IProfileImageInputAttributes, ngModelCtrl: ng.INgModelController) => {
            var self = this;

            // jQueryEvent
            elements.bind("change", function (changeEvent) {
                scope.profileImageInput = changeEvent.target.files[0]; // image selected
                if (typeof scope.profileImageInput !== "undefined") {
                    if (scope.profileImageInput.size < 5000000 && (scope.profileImageInput.type === 'image/jpg' || scope.profileImageInput.type === 'image/jpeg' || scope.profileImageInput.type === 'image/png')) {
                        var reader = new FileReader();
                        reader.onload = function (loadEvent) {
                            var loaded = this;
                            scope.$apply(function () {
                                var image = loaded.result; 
                                scope.profileImagePreview = image;

                                scope.onShowModal(image, attrs.profileType);
                            });
                        }
                        reader.readAsDataURL(scope.profileImageInput);
                    }
                    else {
                        scope.profileImagePreview = undefined;
                        alert('Please select a valid image format up to 5MB.');
                    }  
                }
                else {
                    scope.$apply(function () {
                        scope.profileImagePreview = undefined;
                    });
                }

            });

            scope.onShowModal = (image: any, pType: string) => {
                var modalInstance: angular.ui.bootstrap.IModalServiceInstance = self.$uibModal.open({
                    animation: true,
                    templateUrl: "/appCommon/directives/profileImage/profileImageCropper.modal.html",
                    controller: () => new ProfileImageCropperModalController(self.$rootScope, scope, modalInstance, self.authService, self.profileImageService, self.errorHandlingService, image, pType),
                    controllerAs: "cropVm",
                    resolve: {
                        image: () => image
                    }
                });

                modalInstance.result.then(data => {
                    if (data) {
                        self.$state.reload();
                    }
                });
            }

        }


    }

    angular.module("app.common")
        .directive("profileImageInput",
        [
            "$rootScope", "$state", "$uibModal", "AuthService", "ProfileImageService", "ErrorHandlingService",
            (root, st, mod, auth, piu, err) => new ProfileImageInputDirective(root, st, mod, auth, piu, err)
        ]);
}