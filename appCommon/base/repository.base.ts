module AppCommon {
    export class RepositoryBase<T> extends RestClientBase {
        methodNameForFetch = "Get";
        methodNameForGetByID = "GetByID";
        methodNameForGetAll = "GetAll";
        methodNameForCreate = "Create";
        methodNameForDelete = "Delete";

        getByID(id: string, baseURL: string): ng.IPromise<T> {
            this.restng.setBaseUrl(baseURL);
            const repositoryObject: any = this;
            const requestPromise: ng.IPromise<Array<T>> = this.restng
                .one(repositoryObject.apiControllerName, repositoryObject.methodNameForGetByID)
                .customGET(id);

            return this.resultOfPromise(requestPromise, baseURL);
        }

        fetch(param1: string, baseURL: string): ng.IPromise<Array<T>> {
            this.restng.setBaseUrl(baseURL);
            const repositoryObject: any = this;
            const requestPromise: ng.IPromise<Array<T>> = this.restng
                .one(repositoryObject.apiControllerName, repositoryObject.methodNameForFetch)
                .getList(param1);

            return this.resultOfPromise(requestPromise, baseURL);
        }

        fetchAll(baseURL: string): ng.IPromise<Array<T>> {
            this.restng.setBaseUrl(baseURL);
            const repositoryObject: any = this;
            const requestPromise: ng.IPromise<Array<T>> = this.restng
                .one(repositoryObject.apiControllerName, repositoryObject.methodNameForGetAll)
                .getList();

            return this.resultOfPromise(requestPromise, baseURL);
        }

        delete(idToDelete: string, baseURL: string): ng.IPromise<boolean> {
            this.restng.setBaseUrl(baseURL);
            var repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/" + repositoryObject.methodNameForDelete, idToDelete)
                .remove()
                .then(() => {
                    return true;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason.data);
                    return false;
                });
        }

        insert(obj: T, baseURL: string): ng.IPromise<boolean> {
            this.restng.setBaseUrl(baseURL);
            var repositoryObject: any = this;

            var route = repositoryObject.apiControllerName;
            if (!!repositoryObject.methodNameForCreate && repositoryObject.methodNameForCreate.length > 0) {
                route += "/" + repositoryObject.methodNameForCreate;
            }

            return this.restng
                .one(route)
                .customPOST(obj)
                .then(() => {
                    return true; //success
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason.data);
                    return false;
                });
        }

        insertAndReturnObjectBack(obj: T, id: string, baseURL: string): ng.IPromise<T> {
            this.restng.setBaseUrl(baseURL);
            const repositoryObject: any = this;
            return this.insert(obj, baseURL)
                .then(success => {
                    if (success) {
                        return this.getByID(id, baseURL);
                    }
                    return null;
                });
        }

        update(obj: T, baseURL: string): ng.IPromise<void> {
            this.restng.setBaseUrl(baseURL);
            var repositoryObject: any = this;
            return this.restng
                .one(repositoryObject.apiControllerName + "/Update")
                .customPUT(obj)
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason.data);
                });
        }

        private resultOfPromise(requestPromise: ng.IPromise<any>, baseURL: string): ng.IPromise<any> {
            this.restng.setBaseUrl(baseURL);
            var repositoryObject: any = this;
            return requestPromise
                .then((data) => {
                    var finalResult = this.restng.stripRestangular(data);
                    return finalResult;
                })
                .catch((failReason) => {
                    this.errorHandlingService.showPageErrorFromErrorObject(failReason.data);
                    return new Array<T>();
                });

        }
    }
}