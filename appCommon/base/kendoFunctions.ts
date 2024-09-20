module AppCommon {

    export class KendoFunctions {

        static getToolbarOptions(canCreate: boolean, canUpdate: boolean, canExport: boolean): any[] {
            const toolbarOptions = [];
            if (canCreate) toolbarOptions.push("create");
            if (canUpdate) {
                toolbarOptions.push("save");
                toolbarOptions.push("cancel");
            }
            if (canExport) {
                toolbarOptions.push("excel");
                toolbarOptions.push("pdf");
            }
            return toolbarOptions;
        }

        static getGridOptions(dataSource: any, repositoryName: string, canCreate: boolean, canUpdate: boolean, filterable: any, columns: any, saveChanges: any = null, editable: any = "incell", editFunction: any = null): any {

            return {
                dataSource: dataSource,
                pageable: false,
                scrollable: false,
                filterable: filterable,
                navigatable: true,
                resizable: true,
                sortable: true,
                groupable: true,
                reorderable: true,
                selectable: true,
                toolbar: this.getToolbarOptions(canCreate, canUpdate, true),
                saveChanges: saveChanges,
                excel: {
                    fileName: repositoryName + "s.xlsx",
                    filterable: true
                },
                pdf: {
                    fileName: repositoryName + "s.pdf",
                    allPages: true,
                    avoidLinks: true,
                    paperSize: "A4",
                    margin: { top: "1cm", left: "1cm", right: "1cm", bottom: "1cm" },
                    repeatHeaders: true,
                    landscape: true,
                    scale: 0.5
                },
                editable: editable,
                remove: function(e) {
                    dataSource.remove(e.model);
                    dataSource.sync();
                },
                columns: columns,
                edit: editFunction
            };
        }
        
           
        static getEnumAsKendoDataSource(currentEnum: any, excludeTheseEnumValues: any[]): kendo.data.DataSource {
            //get status enum as a list
            var statusList = new kendo.data.DataSource({
                schema: {
                    model: {
                        id: "Value",
                        fields: {
                            Value: { type: "number" },
                            Description: {}
                        }
                    }
                }
            });
            var statusEnumList = AppCommon.EnumUtils.getNamesAndValues(currentEnum);
            for (var item of statusEnumList) {
                if (!!excludeTheseEnumValues && excludeTheseEnumValues.indexOf(item.value) > -1) {
                } else {
                    statusList.add({ Description: AppCommon.GenericUtils.camelToTitle(item.name), Value: item.value });
                }
            }
            return statusList;
        }

        static getDefinedListAsKendoDataSource(definedListName: string): kendo.data.DataSource {
            //get categories
            var dataSourceIssueCategoryList = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: AppConfig.APIHOST + "DefinedList/Get/" + definedListName,
                        type: "get",
                        beforeSend: req => {
                            req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                        }
                    }
                },
                schema: {
                    model: {
                        id: "Value",
                        fields: {
                            ID: {},
                            Value: {},
                            Description: {},
                            IsPreferred: {}
                        }
                    }
                }
            });
            dataSourceIssueCategoryList.sort([
                { field: "Description", dir: "asc" }
            ]);
            return dataSourceIssueCategoryList;
        }

        static getEmployees(url: string): kendo.data.DataSource {
            //get employees list
            var employeesSchema = {
                model: {
                    id: "FriendlyID",
                    fields: {
                        ID: {},
                        FriendlyID: {}
                    }
                }
            };
            var employeesReadCommand = {
                url: url,
                type: "get",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                }
            };
            var employeeList = AppCommon.KendoDataSourceFactory.createKendoDataSource("Employee", employeesSchema, null, employeesReadCommand);
            employeeList.sort([
                { field: "FriendlyID", dir: "asc" }
            ]);
            return employeeList;
        }

        static findEmployeeIDInKendoDataSource(employeeFriendlyID: string, list: kendo.data.DataSource): string {
            if (!!list) {
                var model: any = list.get(employeeFriendlyID);
                if (!!model) return model.ID;
            }
            return null;
        }

        static getOfferedServices(url: string): kendo.data.DataSource {
            //get list
            var schema = {
                model: {
                    id: "ID",
                    fields: {
                        ID: {},
                        ServiceName: {}
                    }
                }
            };
            var readCommand = {
                url: url,
                type: "get",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                }
            };
            var list = AppCommon.KendoDataSourceFactory.createKendoDataSource(CommonConfiguration_Routing.OfferedServiceRoute, schema, null, readCommand);
            list.sort([
                { field: "ServiceName", dir: "asc" }
            ]);
            return list;
        }

        static getTieredRates(url: string): kendo.data.DataSource {
            //get list
            var schema = {
                model: {
                    id: "ID"
                }
            };
            var readCommand = {
                url: url,
                type: "get",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                }
            };
            var list = AppCommon.KendoDataSourceFactory.createKendoDataSource(CommonConfiguration_Routing.OperatingLocationRoute, schema, null, readCommand);
            list.sort([
                { field: "Name", dir: "asc" }
            ]);
            return list;
        }

        static checkCells = (grid: any): boolean => {
            // http://stackoverflow.com/questions/24655663/kendo-data-grid-add-new-record-ignores-validation-rules
            var rows = grid.tbody.find("tr");                   //get rows
            for (var i = 0; i < rows.length; i++) {

                var rowModel = grid.dataItem(rows[i]);          //get row data
                if (rowModel && rowModel.isNew() || rowModel.IsUpdated) {

                    var colCells = $(rows[i]).find("td");       //get cells
                    for (var j = 0; j < colCells.length; j++) {
                        if ($(colCells[j]).hasClass('k-group-cell'))
                            continue;                           //grouping enabled will add extra td columns that aren't actual columns
                        if ($(colCells[j]).hasClass('k-hierarchy-cell'))
                            continue;                           //hierarchy cell is not actual column             
                        grid.editCell($(colCells[j]));          //open for edit
                        if (grid.editable) {                    //check if editable
                            if (!grid.editable.end()) {         //trigger validation
                                return false;                   //if fail, return false
                            }
                            else {
                                grid.closeCell();               //if success, keep checking
                            }
                        }
                    }
                }
            }
            return true;                                        //all cells are valid
        }

        static dirtyField = (data: any, fieldName: string) => {
            // http://www.telerik.com/forums/losing-dirty-flag-on-edited-items-when-i-click-add-new-item
            if (data.dirty && data.dirtyFields[fieldName]) {
                return "<span class='k-dirty'></span>";
            }
            else {
                return "";
            }
        }

        // util method used for KendoSpreadsheet DropdownList selector
        static getValidatorKendoList = (values: any): string => {
             return JSON.stringify(values).replace("[", "{").replace("]", "}");
        }

    }
}