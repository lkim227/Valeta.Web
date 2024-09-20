module AppStaff {
    export interface IOrderedLotAttrs extends ng.IAttributes {
        canCreate: string;
        canUpdate: string;
        canDelete: string;
    }

    export interface IOrderedLotScope extends ng.IScope {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;

        selectedOperatingLocationId: string;
        lots: string[];
        lotsIndex: number[];
        addLot(): void;
        formMessages: any;

        newLot: string;
        gridOptions: any;
        draggable: kendo.ui.Draggable;
        dataSource: kendo.data.DataSource;
    }

    class OrderedLotDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppCommon.AppCommonConfig.kendoGridBaseUrl;
        scope = {
            selectedOperatingLocationId: "=?",
            lots: "=?"
        };

        static $inject = ["SessionService", "OperatingLocationRepository"];

        constructor(private sessionService: AppCommon.SessionService, private operatingLocationRepository: AppCommon.OperatingLocationRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: ILotScope, elements: ng.IAugmentedJQuery, attrs: ILotAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            scope.formMessages = AppCommon.FormMessages;

            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");

            scope.canCreate = getBooleanAttribute(attrs.canCreate);
            scope.canUpdate = getBooleanAttribute(attrs.canUpdate);
            scope.canDelete = getBooleanAttribute(attrs.canDelete);


            //build datasource
            //scope.dataSource = new kendo.data.DataSource({
            //    data: scope.lots,
            //    autoSync: false,
            //    batch: false
            //});

            //scope.addLot = function() {
            //    scope.dataSource.add(scope.newLot);
            //};

            ////build grid
            //var filterable = "false";
            //var columns = [
            //    { field: "LotName", title: "Lot", filterable: false },
            //    { command: "destroy", title: "", width: "120px" }
            //];
            //scope.gridOptions = {
            //    dataSource: scope.dataSource,
            //    pageable: false,
            //    scrollable: false,
            //    navigatable: true,
            //    filterable: filterable,
            //    resizable: true,
            //    reorderable: true,
            //    draggable: true,
            //    selectable: true,
            //    toolbar: AppCommon.KendoFunctions.getToolbarOptions(true, false, false),
            //    editable: "incell",
            //    remove: function(e) {
            //        scope.dataSource.remove(e.model);
            //    },
            //    columns: columns
            //};

            //    var selectedClass = 'k-state-selected';
            //    $(document).on('click', '#grid tbody tr', function (e) {
            //        if (e.ctrlKey || e.metaKey) {
            //            this.toggleClass(selectedClass);
            //        } else {
            //            this.addClass(selectedClass).siblings().removeClass(selectedClass);
            //        }
            //    });

            //    scope.gridOptions.Draggable = {
            //        filter: "tbody tr",
            //        group: "gridGroup",
            //        axis: "y",
            //        hint: function (item) {
            //            var helper = $('<div class="k-grid k-widget drag-helper"/>');
            //            if (!item.hasClass(selectedClass)) {
            //                item.addClass(selectedClass).siblings().removeClass(selectedClass);
            //            }
            //            var elements = item.parent().children('.' + selectedClass).clone();
            //            item.data('multidrag', elements).siblings('.' + selectedClass).remove();
            //            return helper.append(elements);
            //        }
            //    };

            //    scope.gridOptions.kendoDropTarget = {
            //        group: "gridGroup",
            //        drop: function (e) {

            //            var draggedRows = e.draggable.hint.find("tr");
            //            e.draggable.hint.hide();
            //            var dropLocation = $(document.elementFromPoint(e.clientX, e.clientY)),
            //                dropGridRecord = scope.dataSource.getByUid(dropLocation.parent().attr("data-uid"))
            //            if (dropLocation.is("th")) {
            //                return;
            //            }

            //            var beginningRangePosition = scope.dataSource.indexOf(dropGridRecord),//beginning of the range of dropped row(s)
            //                rangeLimit = scope.dataSource.indexOf(scope.dataSource.getByUid(draggedRows.first().attr("data-uid")));//start of the range of where the rows were dragged from


            //            //if dragging up, get the end of the range instead of the start
            //            if (rangeLimit > beginningRangePosition) {
            //                draggedRows.reverse();//reverse the records so that as they are being placed, they come out in the correct order
            //            }

            //            //assign new spot in the main grid to each dragged row
            //            draggedRows.each(function () {
            //                var thisUid = $(this).attr("data-uid"),
            //                    itemToMove = scope.dataSource.getByUid(thisUid);
            //                scope.dataSource.remove(itemToMove);
            //                scope.dataSource.insert(beginningRangePosition, itemToMove);
            //            });


            //            //set the main grid moved rows to be dirty
            //            draggedRows.each(function () {
            //                var thisUid = $(this).attr("data-uid");
            //                scope.dataSource.getByUid(thisUid).set("dirty", true);
            //            });

            //            //remark things as visibly dirty
            //            //var dirtyItems = $.grep(scope.dataSource.view(), function (e) { return e.dirty === true; });
            //            //for (var a = 0; a < dirtyItems.length; a++) {
            //            //    var thisItem = dirtyItems[a];
            //            //    scope.dataSource.tbody.find("tr[data-uid='" + thisItem.get("uid") + "']").find("td:eq(0)").addClass("k-dirty-cell");
            //            //    scope.dataSource.tbody.find("tr[data-uid='" + thisItem.get("uid") + "']").find("td:eq(0)").prepend('<span class="k-dirty"></span>')
            //            //};
            //        }
            //    }
        };

    }

    angular.module("app.staff")
        .directive("orderedLot",
            ["SessionService", "OperatingLocationRepository", (s, olp) => new OrderedLotDirective(s, olp)]);
}