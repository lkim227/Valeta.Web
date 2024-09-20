module AppCommon {
    export class ManufactureRepository extends RestClientBase {
        apiControllerName = "Manufacture";

        getAllMakes(): ng.IPromise<Array<string>> {
            return this.restng
                .one(this.apiControllerName + "/GetAllMakes")
                .getList()
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return new Array<string>();
                });
        }

        getAllModelsByMake(make: string): ng.IPromise<Array<string>> {
            return this.restng
                .one(this.apiControllerName + "/GetAllModelsByMake")
                .getList(make)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return new Array<string>();
                });
        }

        getAllYearsByMakeModel(make: string, model: string): ng.IPromise<Array<string>> {
            return this.restng
                .one(this.apiControllerName + "/GetAllYearsByMakeModel")
                .one(make)
                .one(model)
                .getList()
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return new Array<string>();
                });
        }

    }

    angular.module("app.common")
        .service("ManufactureRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new ManufactureRepository(restangularService, errorHandlingService)
        ]);
}