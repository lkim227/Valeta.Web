module AppCommon {
    export class PointsAccountingRepository extends RepositoryBase<PointsAccountingDTO> {
        //repository configuration
        apiControllerName = "PointsAccounting";
        methodNameForFetch = "GetByAccountID";

        getSummaryByAccountID(accountID: string): ng.IPromise<Array<number>> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/GetSummaryByAccountID")
                .customGET(accountID)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There is a problem accessing your points summary data.");
                    return null;
                });
        }

        changeRewardStatus(pointsAccountingID: string, status: string, employeeFriendlyID: string): ng.
            IPromise<boolean> {
            const repositoryObject: any = this;
            let route = "";
            switch (status.toLowerCase()) {
            case "completed":
                route = repositoryObject.apiControllerName + "/MakeCompleted";
                break;
            }

            return this.restng
                .one(route + "/" + pointsAccountingID)
                .customGET(employeeFriendlyID)
                .then((data) => {
                    if (data) return true;
                    return false;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There is a problem with your reservation.  Please try to submit it again.");
                    return false;
                });
        }

        getByReservationID(reservationID: string): ng.IPromise<Array<PointsAccountingDTOExtended>> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/GetByReservationID")
                .customGET(reservationID)
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason, "There is a problem accessing your points history.");
                    return null;
                });
        }

        getAllPendingExtended(): ng.IPromise<Array<PointsAccountingDTOExtended>> {
            const repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/GetAllPendingExtended")
                .getList()
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                    return new Array<PointsAccountingDTOExtended>();
                });
        }

        updateNotes(obj: PointsAccountingDTOExtended): ng.IPromise<void> {
            var repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/UpdateNotes")
                .customPUT(obj)
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason);
                });
        }
    }

    angular.module("app.common")
        .service("PointsAccountingRepository",
        [
            "Restangular", "ErrorHandlingService",
            (restangularService, errorHandlingService) => new PointsAccountingRepository(restangularService, errorHandlingService)
        ]);
}