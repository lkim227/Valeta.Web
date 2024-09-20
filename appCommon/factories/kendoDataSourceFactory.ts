module AppCommon {

    export class KendoDataSourceFactory {

        static getAllReadCommand(repositoryName: string): any {
            return {
                url: AppConfig.APIHOST + "" + repositoryName + "/GetAll",
                type: "get",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                }
            };
        }

        static getUpdateCommand(repositoryName: string): any {
            return {
                url: AppConfig.APIHOST + "" + repositoryName + "/UpdateAndQuery",
                type: "post",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                }
            };
        }

        static getCreateCommand(repositoryName: string): any {
            return {
                url: AppConfig.APIHOST + "" + repositoryName + "/CreateAndQuery",
                type: "post",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                }
            };
        }

        static getDestroyCommand(repositoryName: string): any {
            return {
                url: function (options) {
                    return AppConfig.APIHOST + "" + repositoryName + "/Delete/" + options.ID;
                },
                type: "delete",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", RestClientBase.authorizationHeader);
                }
            }
        }

        static getTransport(repositoryName: string, readCommand: any, updateCommand: any, createCommand: any, destroyCommand: any): any {
            return {
                read: readCommand,
                update: updateCommand,
                create: createCommand,
                destroy: destroyCommand
            };
        }

        static getTransportWithParameterMap(repositoryName: string, parameterMap: any, readCommand: any, updateCommand: any, createCommand: any, destroyCommand: any): any {
            return {
                read: readCommand,
                parameterMap: parameterMap,
                update: updateCommand,
                create: createCommand,
                destroy: destroyCommand
            };
        }

        static createKendoDataSource(repositoryName: string, schema: any, parameterMap: any,
            readCommand: any, updateCommand: any = null, createCommand: any = null, destroyCommand: any = null,
            errorHandler: any = null, changeHandler: any = null): kendo.data.DataSource {

            if (readCommand === null) readCommand = this.getAllReadCommand(repositoryName);
            if (updateCommand === null) updateCommand = this.getUpdateCommand(repositoryName);
            if (createCommand === null) createCommand = this.getCreateCommand(repositoryName);
            if (destroyCommand === null) destroyCommand = this.getDestroyCommand(repositoryName);

            if (parameterMap != null) {
                const transport = this.getTransportWithParameterMap(repositoryName, parameterMap, readCommand, updateCommand, createCommand, destroyCommand);
                return new kendo.data.DataSource({
                    transport: transport,
                    autoSync: false,
                    batch: false,
                    schema: schema,
                    error: errorHandler,
                    change: changeHandler
                });
            } else {
                return new kendo.data.DataSource({
                    transport: this.getTransport(repositoryName, readCommand, updateCommand, createCommand, destroyCommand),
                    autoSync: false,
                    batch: false,
                    schema: schema,
                    error: errorHandler,
                    change: changeHandler
                });
            }
        }

        static createKendoHierarchicalDataSource(repositoryName: string, schema: any, parameterMap: any,
            readCommand: any, updateCommand: any = null, createCommand: any = null, destroyCommand: any = null,
            errorHandler: any = null, changeHandler: any = null): kendo.data.HierarchicalDataSource {

            if (readCommand === null) readCommand = this.getAllReadCommand(repositoryName);
            if (updateCommand === null) updateCommand = this.getUpdateCommand(repositoryName);
            if (createCommand === null) createCommand = this.getCreateCommand(repositoryName);
            if (destroyCommand === null) destroyCommand = this.getDestroyCommand(repositoryName);

            if (parameterMap != null) {
                return new kendo.data.HierarchicalDataSource({
                    transport: this.getTransportWithParameterMap(repositoryName, parameterMap, readCommand, updateCommand, createCommand, destroyCommand),
                    autoSync: false,
                    batch: false,
                    schema: schema,
                    error: errorHandler,
                    change: changeHandler
                });
            } else {
                return new kendo.data.HierarchicalDataSource({
                    transport: this.getTransport(repositoryName, readCommand, updateCommand, createCommand, destroyCommand),
                    autoSync: false,
                    batch: false,
                    schema: schema,
                    error: errorHandler,
                    change: changeHandler
                });
            }
        }
    }
}