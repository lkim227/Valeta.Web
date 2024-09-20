module AppCommon {
    export class ProfileImageService extends RestClientBase {
        apiControllerName = "ProfileImage";

        getProfileImageUrl(userType: UserType, userId: string): ng.IPromise<string> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/GetProfileImageUrl/" + userType + "/" + userId)
                .customGET("")
                .then((data) => {
                    return data;
                })
                .catch(() => {
                    return null;
                });
        }

        getProfileImageUrls(profileImageUrls: ProfileImageReferenceDTO[]): ng.IPromise<ProfileImageReferenceDTO[]> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/GetProfileImageUrls/")
                .customPOST(profileImageUrls)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch(() => {
                    return null;
                });
        }

        uploadImage(file: File, userId: string, baseURL: string, userType: UserType): ng.IPromise<any> {
            this.restng.setBaseUrl(baseURL);
            this.restng.setDefaultHeaders({});
            var fd = new FormData(); // multipart/form-data
            var self = this;
            fd.append("file", file);

            return self.restng
                .one(self.apiControllerName + "/" + userType + "/" + userId)
                .withHttpConfig({ transformRequest: angular.identity })
                .customPOST(fd, "", undefined, { 'Content-Type': undefined })
                .then((data) => {
                    var finalResult = self.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return null;
                });
        };
    }

    angular.module("app.common")
        .service("ProfileImageService",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new ProfileImageService(restangularService, errorHandlingService, AppConfig.APIHOST)
        ]);
}