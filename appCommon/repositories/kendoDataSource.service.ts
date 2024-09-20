module AppCommon {
    export class KendoDataSourceService {
        getDataSource(
            apiController: string,
            getMethod: string = null,
            getIdentifier: string = null,
            getFilter: string = null,
            progressTagID: string = "#progress",
            parseFunction: Function = (response) => { return response; }): kendo.data.DataSource {

            var getURL = AppConfig.APIHOST + "" + apiController;
            if (!!getMethod) getURL += "/" + getMethod;
            if (!!getIdentifier) getURL += "/" + getIdentifier;
            if (!!getFilter) getURL += "/" + getFilter;

            return new kendo.data.DataSource({
                transport: {
                    read: {
                        url: getURL,
                        type: "get",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                        }
                    },
                    update: {
                        url: AppConfig.APIHOST + "" + apiController + "/UpdateAndQuery",
                        type: "post",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                        }
                    },
                    create: {
                        url: AppConfig.APIHOST + "" + apiController + "/CreateAndQuery",
                        type: "post",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                        }
                    },
                    destroy: {
                        url: options => (AppConfig.APIHOST + apiController + "/Delete/" + options.ID),
                        type: "delete",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                        }
                    }
                },
                autoSync: false,
                batch: false,
                schema: {
                    model: {
                        id: "ID"
                    },
                    parse: parseFunction
                },
                requestStart: function () {
                    if (!!progressTagID) {
                        kendo.ui.progress($(progressTagID), true);
                    }
                },
                requestEnd: function() {
                    if (!!progressTagID) {
                        kendo.ui.progress($(progressTagID), false);
                    }
                }
            });
        }

        getDataSourceWithDispatchParameters(apiController: string, getMethod: string, dispatchParameters: DispatchParameters, parseFunction: Function = (response) => { return response; }): kendo.data.DataSource {
            var getURL = AppConfig.APIHOST + "" + apiController + "/" + getMethod;
            return new kendo.data.DataSource({
                transport: {
                    read: {
                        url: getURL,
                        dataType: "json",
                        contentType: "application/json",
                        type: "post",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                        }
                    },
                    parameterMap: function (data, type) {
                            return JSON.stringify(dispatchParameters);
                    },
                    update: {
                        url: AppConfig.APIHOST + "" + apiController + "/UpdateAndQuery",
                        type: "post",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                        }
                    },
                    create: {
                        url: AppConfig.APIHOST + "" + apiController + "/CreateAndQuery",
                        type: "post",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                        }
                    },
                    destroy: {
                        url: options => (AppConfig.APIHOST + apiController + "/Delete/" + options.ID),
                        type: "delete",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                        }
                    }
                },
                autoSync: false,
                batch: false,
                schema: {
                    model: {
                        id: "ID"
                    },
                    parse: parseFunction
                }
            });
        }

        getDataSourceOptionsWithGrouping(
            apiController: string,
            getMethod: string,
            dispatchParameters: DispatchParameters,
            groupingField: string
        ): kendo.data.DataSourceOptions {
            const getURL = AppConfig.APIHOST + "" + apiController + "/" + getMethod;
            var optionsDS: kendo.data.DataSourceOptions = {
                transport: {
                    read: {
                        url: getURL,
                        dataType: "json",
                        contentType: "application/json",
                        type: "post",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                        }
                    },
                    parameterMap: function(data, type) {
                        return JSON.stringify(dispatchParameters);
                    },
                    update: {
                        url: AppConfig.APIHOST + "" + apiController + "/UpdateAndQuery",
                        type: "post",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                        }
                    },
                    create: {
                        url: AppConfig.APIHOST + "" + apiController + "/CreateAndQuery",
                        type: "post",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                        }
                    },
                    destroy: {
                        url: options => (AppConfig.APIHOST + apiController + "/Delete/" + options.ID),
                        type: "delete",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                        }
                    }
                },
                autoSync: false,
                batch: false,
                schema: {
                    model: {
                        id: "ID"
                    }
                },
                group: [
                    { field: groupingField }
                ]
            };
            return optionsDS;
        }

        getSignalrDataSourceWithGrouping(hub: SignalR.Hub.Proxy, hubStart: JQueryPromise<any>, dispatchParameters: DispatchParameters, groupingField: string, readMethod = "read"): kendo.data.DataSourceOptions {
            var optionsDS: kendo.data.DataSourceOptions = {
                type: "signalr",
                autoSync: false,
                transport: {
                    parameterMap: function (data, type) {
                        if (type === "read") {
                            data = dispatchParameters;
                        }
                        return data;
                    },
                    signalr: {
                        promise: hubStart,
                        hub: hub,
                        server: {
                            read: readMethod,
                            update: "update",
                            destroy: "destroy",
                            create: "create"
                        },
                        client: {
                            read: "read",
                            update: "update",
                            destroy: "destroy",
                            create: "create"
                        }
                    }
                },
                batch: true,
                schema: {
                    model: {
                        id: "ID"
                    }
                },
                group: [
                    { field: groupingField }
                ]
            };

            return optionsDS;
        }

        getSignalrDataSource(hub: SignalR.Hub.Proxy, hubStart: JQueryPromise<any>, dispatchParameters: DispatchParameters, readMethod = "read", updateMethod = "update"): kendo.data.DataSourceOptions {
            var optionsDS: kendo.data.DataSourceOptions = {
                type: "signalr",
                autoSync: true,
                transport: {
                    parameterMap: function (data, type) {
                        if (type === "read") {
                            data = dispatchParameters;
                        }
                        return data;
                    },
                    signalr: {
                        promise: hubStart,
                        hub: hub,
                        server: {
                            read: readMethod,
                            update: updateMethod,
                            destroy: "destroy",
                            create: "create"
                        },
                        client: {
                            read: readMethod,
                            update: updateMethod,
                            destroy: "destroy",
                            create: "create"
                        }
                    }
                },
                batch: true,
                schema: {
                    model: {
                        id: "ID"
                    }
                }
            };

            return optionsDS;
        }
    }

    angular.module("app.common")
        .service("KendoDataSourceService",
        [() => new KendoDataSourceService()]);
}