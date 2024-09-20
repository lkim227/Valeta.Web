module AppStaff {
    export interface ISentMessagesAttrs extends ng.IAttributes {
    }

    export interface ISentMessagesScope extends ng.IScope {
        context: string;
        identifier: string;
        statusMessage: string;

        gridOptions: any;
    }

    class SentMessagesDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommon.AppCommonConfig.kendoGridBaseUrl;
        scope = {
            context: "=",
            identifier: "="
        };

        static $inject = ["$stateParams", "SessionService", "CommunicationService"];

        constructor(
            private $stateParams: ng.ui.IStateParamsService,
            private sessionService: AppCommon.SessionService,
            private communicationService: AppCommon.CommunicationService) {
        }

        link: ng.IDirectiveLinkFn = (scope: ISentMessagesScope, elements: ng.IAugmentedJQuery, attrs: ISentMessagesAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;

            var url = AppConfig.APIHOST + "Communication/GetAllByReference/" + scope.context + "/" + scope.identifier;
            //if (scope.context === ConfigureRoutesForCommunicationContext.referenceContextAll) {
            //    url = AppConfig.APIHOST + "Communication/GetAllForCustomer/" + scope.identifier + "/" + scope.identifier;
            //}
            //build datasource
            var schema = {
                model: {
                    id: "ID",
                    fields: {
                        ID: { editable: false },
                        Updated: { type: "date", editable: false },
                        UpdatedBy: { editable: false },
                        MessageStatus: { editable: false },
                        To: { editable: false },
                        Content: { editable: false }
                    }
                }
            };
            var readCommand = {
                url: url,
                type: "get",
                dataType: "json",
                contentType: "application/json",
                beforeSend: req => {
                    req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                }
            };
            var dataSource = AppCommon.KendoDataSourceFactory.createKendoDataSource("Communication", schema, null, readCommand);

            //build grid
            var filterable = "false";
            var columns = [
                {
                    field: "ID",
                    hidden: true
                },
                {
                    field: "MessageStatus",
                    title: "Status",
                    template: "#= AppCommon.GenericUtils.camelToTitle(AppCommon.CommunicationUtils.MessageStatusToTitle(MessageStatus)) #"
                },
                {
                    field: "Updated",
                    title: "Date",
                    template: "#= (!!Updated) ? kendo.toString(kendo.parseDate(Updated), \"g\") : '' #"
                },
                {
                    field: "To"
                },
                {
                    field: "MessageContext.TemplateName",
                    title: "Template"
                },
                {
                    field: "Content"
                }
            ];
            scope.gridOptions = AppCommon.KendoFunctions.getGridOptions(
                dataSource,
                "Communication",
                false,
                false,
                filterable,
                columns);


            var waitForScopeVariables = () => {
                var deregisterWait = scope.$watch("context",
                    (newValue) => {
                        if (typeof (newValue) !== "undefined") {
                            deregisterWait();

                            dataSource.read();
                        }
                    });;
            }

            waitForScopeVariables();

        };

    }

    angular.module("app.staff")
        .directive("sentMessages",
        [
            "$stateParams", "SessionService", "CommunicationService",
            (sp, s, c) => new SentMessagesDirective(sp, s, c)
        ]);
}