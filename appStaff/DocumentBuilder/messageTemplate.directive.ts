module AppStaff {
    export interface IMessageTemplateAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IMessageTemplateScope extends ng.IScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        accessLevel: AccessLevel;
        hasEditAccess: boolean;
        editType: string;
        createdBy: string;
        
        formMessages: any;
        utils: AppCommon.GenericUtils;
        enumUtils: AppCommon.EnumUtils;

        messageTypeEmail: number;
        messageTypeList: kendo.data.DataSource;
        emptyGuid: string;

        buildKendoGrid(): void;
        templatesDataSource: kendo.data.DataSource; // TemplateContentWithTemplateDTO[]
        gridOptions: any;

        updateTemplateModal: any;
        updateTemplate(): void;
        openUpdateTemplate(): void;
        cancelUpdateTemplate(): void;
        currentTemplate: TemplateContentWithTemplateDTO;
        currentEditor: kendo.ui.Editor;
        setCurrentTemplate(currentTemplate: TemplateContentWithTemplateDTO): void;
        editorTools: any;

        operatingLocationChoices: OperatingLocationDTO[];
        selectedOperatingLocation: OperatingLocationDTO;
        operatingLocationChanged(): void;

        templateNames: TemplateDTO[];

        addTemplateNameModal: any;
        addTemplateName(selectedTemplate: any): void;
        openAddTemplateName(): void;
        cancelAddTemplateName(): void;
    }

    class MessageTemplateDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.messageTemplateTemplateUrl;
        scope = { };

        static $inject = ["SessionService", "TemplateContentWithTemplateRepository", "TemplateRepository", "OperatingLocationRepository", "AuthService", "$uibModal"];

        constructor(private sessionService: AppCommon.SessionService,
            private templateContentWithTemplateRepository: TemplateContentWithTemplateRepository,
            private templateRepository: TemplateRepository,
            private operatingLocationRepository: AppCommon.OperatingLocationRepository,
                    private authService: AppCommon.AuthService,
                    private $uibModal: angular.ui.bootstrap.IModalService) {
        }

        link: ng.IDirectiveLinkFn = (scope: IMessageTemplateScope, elements: ng.IAugmentedJQuery, attrs: IMessageTemplateAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;
            scope.utils = AppCommon.GenericUtils;
            scope.enumUtils = AppCommon.EnumUtils;
            scope.messageTypeEmail = MessageType.Email;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.accessLevel = self.authService.getMyAccessLevel(AppCommon.AuthService.RIGHTS.systemSetup);
            scope.hasEditAccess = scope.accessLevel >= AccessLevel.Edit;

            scope.canCreate = false; //overwritten in operatingLocationChanged
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate) && scope.hasEditAccess;
            scope.canDelete = getBooleanAttribute(attrs.canDelete) && scope.hasEditAccess;
            scope.editType = "false";

            scope.createdBy = self.sessionService.userInfo.employeeFriendlyID;

            scope.emptyGuid = AppCommon.GuidService.EmptyGuid();

            this.operatingLocationRepository.fetchAll(AppConfig.APIHOST)
                .then(data => {
                    scope.operatingLocationChoices = data;
                    var allOperatingLocation = new OperatingLocationDTO();
                    allOperatingLocation.ID = scope.emptyGuid;
                    allOperatingLocation.Name = "All";
                    scope.operatingLocationChoices.splice(0, 0, allOperatingLocation);
                    if (scope.selectedOperatingLocation == null) scope.selectedOperatingLocation = allOperatingLocation;
                    scope.operatingLocationChanged();
                });
            
            scope.operatingLocationChanged = (): void => {
                if (!!scope.selectedOperatingLocation) {
                    var id = scope.selectedOperatingLocation.ID;

                    self.templateRepository.getByGroup(id)
                        .then((data) => {
                            if (!!data) {
                                scope.templateNames = data;
                                scope.canCreate =
                                    getBooleanAttribute(attrs.canCreate) &&
                                    scope.hasEditAccess &&
                                    !!scope.selectedOperatingLocation &&
                                    scope.templateNames.length > 0;
                                if (id === scope.emptyGuid) scope.canCreate = false;
                            }
                        });

                    scope.buildKendoGrid(); // rerender
                }
            };

            scope.buildKendoGrid = (): void => {
                //build datasource
                var schema = {
                    model: {
                        id: "TemplateContentID",
                        fields: {
                            "Template.TemplateName": { editable: false },
                            "Template.MessageType": { editable: false },
                            "TemplateContent.Content": { editable: false },
                            "TemplateContent.Updated": { editable: false },
                            "TemplateContent.UpdatedBy": { editable: false }
                        }
                    }
                }

                var readCommand = {
                    url: AppConfig.APIHOST + "TemplateContentWithTemplate/GetByOperatingLocation/" + scope.selectedOperatingLocation.ID,
                    type: "get",
                    dataType: "json",
                    contentType: "application/json",
                    beforeSend: req => {
                        req.setRequestHeader("Authorization", AppCommon.RestClientBase.authorizationHeader);
                    }
                };

                scope.templatesDataSource = AppCommon.KendoDataSourceFactory.createKendoDataSource("TemplateContentWithTemplate", schema, null, readCommand);
                scope.templatesDataSource.fetch(() => {
                    // force to rerender table when OL changes
                    var grid = $("#gridMessageTemplates").data("kendoGrid");
                    grid.setDataSource(scope.templatesDataSource);
                    grid.refresh();
                });

                //get messageTypeList enum as a list
                //scope.messageTypeList = AppCommon.KendoFunctions.getEnumAsKendoDataSource(MessageType, null);
                //var messageOptions = "<input k-on-change=\"dataItem.dirty=true\" kendo-drop-down-list k-data-text-field=\x22'Description'\x22 k-data-value-field=\x22'Value'\x22  k-data-source=\"messageTypeList\" k-value-primitive=\"true\" k-ng-model=\"dataItem.MessagePlatform\" name=\"MessagePlatform\"/>";

                //build grid
                var filterable = "false";
                var columns = [
                    { field: "Template.TemplateName", title: "Template", width: "150px" },
                    { field: "Template.MessageType", title: "Type", template: "#= AppCommon.GenericUtils.camelToTitle(AppCommon.EnumUtils.getNameForValueMessageType(Template.MessageType)) #" },
                    { field: "TemplateContent.Content", title: "Content" },
                    {
                        field: "TemplateContent.Updated", title: "Last Updated",
                        template: "#= (!!TemplateContent.Updated) ? kendo.toString(kendo.parseDate(TemplateContent.Updated), \"g\") : '' #"
                    },
                    { field: "TemplateContent.UpdatedBy", title: "By" },
                    {
                        command: {
                            text: "Edit",
                            click: function (kendoEvent) {
                                kendoEvent.preventDefault();

                                const dataitem = this.dataItem($(kendoEvent.currentTarget).closest("tr"));
                                scope.setCurrentTemplate(dataitem);

                                var fieldStart = "[[";
                                var fieldEnd = "]]";
                                var mergeItems = [];
                                if (!!dataitem.Template.MergeFields) {
                                    for (var i = 0; i < dataitem.Template.MergeFields.length; i++) {
                                        mergeItems.push({ text: dataitem.Template.MergeFields[i].FriendlyName, value: fieldStart + dataitem.Template.MergeFields[i].FriendlyName + fieldEnd });
                                    }
                                }

                                // Show Modal custom editor
                                scope.openUpdateTemplate();
                                scope.updateTemplateModal.rendered.then(() => {
                                    scope.currentEditor = $("#contentEditor").data("kendoEditor");
                                    if (dataitem.Template.MessageType === MessageType.Email) {
                                        scope.currentEditor.setOptions({
                                            tools: [
                                                {
                                                    name: "insertHtml",
                                                    tooltip: "Merge fields",
                                                    items: mergeItems
                                                },
                                                "bold",
                                                "italic",
                                                "underline",
                                                "justifyLeft",
                                                "justifyCenter",
                                                "justifyRight",
                                                "justifyFull",
                                                "insertUnorderedList",
                                                "insertOrderedList",
                                                "indent",
                                                "outdent",
                                                "createLink",
                                                "unlink",
                                                "insertImage",
                                                "createTable",
                                                "addRowAbove",
                                                "addRowBelow",
                                                "addColumnLeft",
                                                "addColumnRight",
                                                "deleteRow",
                                                "deleteColumn",
                                                "formatting",
                                                "cleanFormatting",
                                                "foreColor",
                                                "backColor",
                                                "print"
                                            ]
                                        });
                                    }
                                    else {
                                        scope.currentEditor.setOptions({
                                            tools: [
                                                {
                                                    name: "insertHtml",
                                                    tooltip: "Merge fields",
                                                    items: mergeItems
                                                }
                                            ]
                                        });
                                    }
                                });
                                
                            }
                        },
                        title: "&nbsp;",
                        width: "120px",
                        hidden: !scope.canUpdate
                    },
                    {
                        command: {
                            text: "Delete",
                            click: function (kendoEvent) {
                                kendoEvent.preventDefault();

                                const dataitem = this.dataItem($(kendoEvent.currentTarget).closest("tr"));
                                const id = dataitem.TemplateContent.ID;

                                if (!!id) {
                                    var response =
                                        confirm("Are you sure you want to delete '" + dataitem.Template.TemplateName + "' template?");
                                    if (response === false) {
                                        return;
                                    }
                                    
                                    self.templateContentWithTemplateRepository.delete(id, AppConfig.APIHOST)
                                        .then(() => {
                                            scope.templatesDataSource.read();
                                        });
                                }
                            }
                        },
                        title: "&nbsp;", width: "120px", hidden: !scope.canDelete
                    }
                ];

                scope.gridOptions = AppCommon.KendoFunctions.getGridOptions(
                    scope.templatesDataSource,
                    "TemplateContentWithTemplate",
                    false, //handled separately
                    false, //handled separately
                    filterable,
                    columns);
            };

            //updating template
            scope.setCurrentTemplate = (currentTemplate: TemplateContentWithTemplateDTO) => {
                scope.currentTemplate = currentTemplate;
            };

            scope.updateTemplate = () => {
                if (!!scope.currentTemplate) {
                    scope.currentTemplate.TemplateContent.UpdatedBy = scope.createdBy;
                    //var tempHtml = HttpUtility.HtmlDecode(scope.currentTemplate.Content);
                    //scope.currentTemplate.Content = tempHtml;
                    self.templateContentWithTemplateRepository.update(scope.currentTemplate, AppConfig.APIHOST)
                        .then(() => {
                            scope.templatesDataSource.read();
                            scope.cancelUpdateTemplate();
                        });
                }
            };

            scope.openUpdateTemplate = () => {
                scope.updateTemplateModal = this.$uibModal.open({
                    templateUrl: 'updateTemplateModalContent',
                    size: 'md',
                    scope: scope,
                    windowClass: 'modal_md-lg'
                });
            };

            scope.cancelUpdateTemplate = () => {
                scope.currentTemplate = null;
                scope.updateTemplateModal.close();
            };


            //template name
            scope.openAddTemplateName = () => {
                scope.currentTemplate = new TemplateContentWithTemplateDTO();
                scope.currentTemplate.TemplateContent = new TemplateContentDTO();
                scope.currentTemplate.TemplateContent.Group = scope.selectedOperatingLocation.ID;
                scope.addTemplateNameModal = this.$uibModal.open({
                    templateUrl: 'addTemplateNameModalContent',
                    size: 'md',
                    scope: scope,
                    windowClass: 'modal_md-lg'
                });
            };

            scope.cancelAddTemplateName = () => {
                scope.currentTemplate = null;
                scope.addTemplateNameModal.close();
            };

            scope.addTemplateName = (selectedTemplate: any) => {
                if (!!selectedTemplate) {
                    scope.currentTemplate.Template = selectedTemplate;
                    scope.currentTemplate.TemplateContent.TemplateID = selectedTemplate.ID;
                    scope.currentTemplate.TemplateContent.ID = AppCommon.GuidService.NewGuid();
                    scope.currentTemplate.TemplateContent.UpdatedBy = scope.createdBy;
                    self.templateContentWithTemplateRepository.insert(scope.currentTemplate, AppConfig.APIHOST)
                        .then(() => {
                            scope.templatesDataSource.read();
                            scope.cancelAddTemplateName();
                        });
                }
            }
        };

    }

    angular.module("app.staff")
        .directive("messageTemplate",
        ["SessionService", "TemplateContentWithTemplateRepository", "TemplateRepository", "OperatingLocationRepository", "AuthService", "$uibModal",
            (s, mtRepo, tr, olr, auth, $uibModal) => new MessageTemplateDirective(s, mtRepo, tr, olr, auth, $uibModal)]);
}