module AppCommon {

    export interface IDefinedListDropdownDirectiveAttributes extends ng.IAttributes {
        required: string;
        viewOnly: string;
    }

    export interface IDefinedListDropdownScope extends ng.IScope {
        required: boolean;
        viewOnly: boolean;

        analyticsEventName: string;
        listLabel: string;
        listType: string;
        selectedDefinedListValue: string;

        showListLabel: boolean;
        dldId: string;
        selectedDefinedListDescription: string;

        updateDefinedListValue(item: DefinedListDTO): void;
        updateSelectFromModel(): void;
    }

    class DefinedListDropdownDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommonConfig.definedListDropdownTemplateUrl;
        scope = {
            analyticsEventName: "@",
            listLabel: "@",
            listType: "@",
            selectedDefinedListValue: "="
        };

        static $inject = ["DefinedListRepository"];

        constructor(private definedListRepository: DefinedListRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IDefinedListDropdownScope,
            elements: ng.IAugmentedJQuery,
            attrs: IDefinedListDropdownDirectiveAttributes,
            ngModelCtrl: ng.INgModelController) => {
            var self = this;

            var definedList: DefinedListDTO[];

            scope.showListLabel = !GenericUtils.isUndefinedNullEmptyOrWhiteSpace(scope.listLabel);
            scope.required = GenericUtils.getBooleanAttribute(attrs.required);
            scope.viewOnly = GenericUtils.getBooleanAttribute(attrs.viewOnly);
            scope.dldId = "definedListDropDown" + Math.floor(Math.random() * 10000000000000000);

            var configureViewOnly = () => {
                if (!scope.selectedDefinedListValue) return;
                var definedListItem = IESafeUtils.arrayFind(definedList, (x) => x.Value === scope.selectedDefinedListValue, this);
                if (!definedListItem) return;
                scope.selectedDefinedListDescription = definedListItem.Description;
            }

            var configureDropdown = () => {
                var element = $("#" + scope.dldId);
                element.kendoComboBox({
                    dataSource: definedList,
                    dataTextField: "Description",
                    dataValueField: "Value",
                    filter: "contains",
                    suggest: true,
                    minLength: 2,
                    change: (e: any) => {
                        if (!!e.sender) {
                            // selectedIndex of -1 indicates custom value
                            if (e.sender.selectedIndex < 0) {
                                if (scope.required) {
                                    e.sender.value(scope.selectedDefinedListValue);
                                } else {
                                    scope.$evalAsync(() => { scope.selectedDefinedListValue = null; e.sender.value(null); });
                                }
                            } else {
                                scope.$evalAsync(() => { scope.selectedDefinedListValue = e.sender.value(); });
                                //element.kendoValidator().validate(); // clears "required" error if it was set
                            }
                        }
                    }
                });

                if (definedList.length === 0) {
                    return;
                }

                var combobox = element.data("kendoComboBox");
                if (!GenericUtils.isUndefinedNullEmptyOrWhiteSpace(scope.selectedDefinedListValue)) {
                    var item = IESafeUtils.arrayFind(definedList,
                        (dl) => String(dl.Value) === String(scope.selectedDefinedListValue),
                        this);

                    if (typeof item !== "undefined") {
                        combobox.value(scope.selectedDefinedListValue);
                    }
                }
                if (scope.required && !combobox.value()) {
                    combobox.select(0);
                    combobox.trigger("change");
                }
            }

            self.definedListRepository.fetch(scope.listType, AppConfig.APIHOST)
                .then((data) => {
                    definedList = data;
                    if (scope.viewOnly) {
                        configureViewOnly();
                    } else {
                        configureDropdown();
                    }
                });

            if (!scope.viewOnly) {
                scope.$watch("selectedDefinedListValue", () => {
                    var element = $("#" + scope.dldId);
                    var combobox = element.data("kendoComboBox");
                    if (!!combobox && combobox.value() !== scope.selectedDefinedListValue) {
                        combobox.value(scope.selectedDefinedListValue);
                    }
                });
            }
        };
    }

    angular.module("app.common")
        .directive("definedListDropdown",
        ["DefinedListRepository", (dlRepository) => new DefinedListDropdownDirective(dlRepository)]);
}