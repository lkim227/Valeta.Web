module AppStaff {
    import GenericUtils = AppCommon.GenericUtils;

    enum DragSource {
        Available = 1,
        Greeter = 2,
        Runner = 3,
        Zone = 4
    }

    export interface IValetPlacementAttrs extends ng.IAttributes {
        canPlace: string;
    }

    export interface IValetPlacementScope extends ng.IScope {
        canPlace: boolean;
        placementEnabled: boolean;
        draggingSomething: boolean;
        showAllActiveValets: boolean;
        showTicketDetails: boolean;

        selectedOperatingLocation: OperatingLocationDTO;
        onChangeOperatingLocation(newOperatingLocation: OperatingLocationDTO): void;
        onFinishRender(rowIndex: number): void;
        removeGreeterFromZone(greeterID: string, zoneID: string, currentZoneColumnIndex: number, currentZoneRowIndex: number, overridePlacementEnabled: boolean): void;
        removeGreeterFromAllZones(greeterID: string): void;
        makeRunnerAvailable(dataItem: kendo.data.Model): void;
        startShift(dataItem: kendo.data.Model): void;
        denyStartShift(dataItem: kendo.data.Model): void;
        endShift(dataItem: kendo.data.Model): void;
        denyEndShift(dataItem: kendo.data.Model): void;
        getTimeInPlace(valet: ValetQueryResult, rowIndex: number, columnIndex: number, zoneID: string): string;
        roleToString(ndx: number): string;
        refreshData(): void;
        toggleTicketDetails(): void;
        doParseToJson(style: string): any;

        zoneLookupList: ZoneDTO[];
        zones: ZoneDTO[][];
        zonesNumberOfRows: number;
        zonesNumberOfColumns: number;
        countOfTicketChangesSinceLastRefresh: number;

        connection: SignalR.Hub.Connection;
        hubTicket: SignalR.Hub.Proxy;
        hubValet: SignalR.Hub.Proxy;
        hubStart: any;

        refreshButtonCounterDataSource: kendo.data.DataSource;
        zoneGreeterListDataSources: kendo.data.DataSource[][];
        valetReadyToStartShiftListDataSource: kendo.data.DataSource;
        valetReadyToEndShiftListDataSource: kendo.data.DataSource;
        availableListDataSource: kendo.data.DataSource;
        greeterListDataSource: kendo.data.DataSource;
        runnerListDataSource: kendo.data.DataSource;
        runnerListOptions: kendo.ui.ListViewOptions;

        valetReadyToEndShiftList: kendo.ui.ListView;
        availableList: kendo.ui.ListView;
        greeterList: kendo.ui.ListView;
        runnerList: kendo.ui.ListView;
        zoneGreeterList: kendo.ui.ListView[][];

        departureSources: kendo.data.DataSource[][];
        departureCounts: number[][];
        returnSources: kendo.data.DataSource[][];
        returnCounts: number[][];
        capturedSources: kendo.data.DataSource[][];
        capturedCounts: number[][];
        tolltagSources: kendo.data.DataSource[][];
        tolltagCounts: number[][];
        nonTolltagCounts: number[][];
        shuttleSources: kendo.data.DataSource[][];
        shuttleCounts: number[][];
        dragSource: DragSource;
        dragColumnIndex: number;
        dragRowIndex: number;

        noZoneDepartureCount: number;
        noZoneDepartureSource: kendo.data.DataSource;
        noZoneReturnCount: number;
        noZoneReturnSource: kendo.data.DataSource;
        noZoneCapturedCount: number;
        noZoneCapturedSource: kendo.data.DataSource;

        ticketUtils: AppCommon.TicketUtils;
        createdBy: string;

        filterFromDateTime: string;
        filterToDateTime: string;
        applyDateFilter(): void;
    }

    class ValetPlacementDirective implements ng.IDirective {
        restrict = "E";
        templateUrl = AppStaffConfig.valetPlacementTemplateUrl;
        scope = {

        };

        static $inject = ["$window", "$state", "$rootScope", "SessionService", "SystemConfigurationService", "KendoDataSourceService", "ValetServiceCommand", "ZoneRepository", "DefinedListRepository"];

        constructor(
            private $window: Window,
            private $state: ng.ui.IStateService,
            private $rootScope: ng.IRootScopeService,
            private sessionService: AppCommon.SessionService,
            private systemConfigurationService: AppCommon.SystemConfigurationService,
            private kendoDataSourceService: AppCommon.KendoDataSourceService,
            private valetServiceCommand: AppCommon.ValetServiceCommand,
            private zoneRepository: AppCommon.ZoneRepository,
            private definedListRepository: AppCommon.DefinedListRepository) {
        }

        link: ng.IDirectiveLinkFn = (scope: IValetPlacementScope, elements: ng.IAugmentedJQuery, attrs: IValetPlacementAttrs, ngModelCtrl: ng.INgModelController) => {
            var self = this;
            var getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true");
            scope.canPlace = getBooleanAttribute(attrs.canPlace);
            scope.placementEnabled = scope.canPlace;
            scope.draggingSomething = false;
            scope.showAllActiveValets = true;
            var minutesInPlaceThreshold = 0;
            scope.createdBy = this.sessionService.userInfo.employeeFriendlyID;

            // 
            // Functions
            //
            scope.doParseToJson = (style: string) => {
                if (!!style && style.length > 0) {
                    return JSON.parse(style);
                }

                return null;
            };
            scope.getTimeInPlace = (valetPlace: ValetQueryResult, columnIndex: number, rowIndex: number, zoneID: string): string => {
                var minutesInPlace = 0;
                if (valetPlace.AssignedZones != null && valetPlace.AssignedZones.length > 0) {
                    var matchingZones = valetPlace.AssignedZones.filter(x => x.ZoneID === zoneID);
                    if (matchingZones.length > 0) {
                        var assignedZone = matchingZones[0];

                        var startDateTime = Date.parse(assignedZone.CheckedInDateTime);
                        if (!startDateTime || startDateTime <= 0) {
                            startDateTime = Date.now();
                        }
                        minutesInPlace = AppCommon.DateTimeUtils.millisecondsToMinutes((Date.now() - startDateTime));
                        if (minutesInPlace > minutesInPlaceThreshold) {
                            $(`#timeInPlace-${rowIndex}X${columnIndex}-${valetPlace.ID}`).addClass("alert-warning");
                        }
                    }
                }
                return AppCommon.DateTimeUtils.minutesToHourMinuteSpanString(minutesInPlace);
            }
            scope.roleToString = (ndx: number): string => {
                // Convert preferred role to a string (needed for html conversion of enum to string)
                return Role[ndx];
            };

            // ***
            // Shift
            // ***
            scope.startShift = (dataItem: kendo.data.Model): void => {
                // Ng-click still fires even when disabled class is added, so check here
                if (scope.placementEnabled) {
                    scope.placementEnabled = false;
                    var command = new StartShiftCommandDTO();
                    command.ID = dataItem.id;
                    command.CreatedBy = scope.createdBy;
                    self.valetServiceCommand.doCommand(ValetConfiguration_Routing.ValetCommandRoute, command)
                        .then(() => scope.$evalAsync(() => scope.placementEnabled = true));
                }
            };
            scope.denyStartShift = (dataItem: kendo.data.Model): void => {
                // Ng-click still fires even when disabled class is added, so check here
                if (scope.placementEnabled) {
                    scope.placementEnabled = false;
                    var command = new DenyStartShiftCommandDTO();
                    command.ID = dataItem.id;
                    command.CreatedBy = scope.createdBy;
                    self.valetServiceCommand.doCommand(ValetConfiguration_Routing.ValetCommandRoute, command)
                        .then(() => scope.$evalAsync(() => scope.placementEnabled = true));
                }
            };
            scope.endShift = (dataItem: kendo.data.Model): void => {
                // Ng-click still fires even when disabled class is added, so check here
                if (scope.placementEnabled) {
                    scope.placementEnabled = false;
                    var command = new EndShiftCommandDTO();
                    command.ID = dataItem.id;
                    command.CreatedBy = scope.createdBy;
                    self.valetServiceCommand.doCommand(ValetConfiguration_Routing.ValetCommandRoute, command)
                        .then(() => scope.$evalAsync(() => scope.placementEnabled = true));
                }
            };
            scope.denyEndShift = (dataItem: kendo.data.Model): void => {
                // Ng-click still fires even when disabled class is added, so check here
                if (scope.placementEnabled) {
                    scope.placementEnabled = false;
                    var command = new DenyEndShiftCommandDTO();
                    command.ID = dataItem.id;
                    command.CreatedBy = scope.createdBy;
                    self.valetServiceCommand.doCommand(ValetConfiguration_Routing.ValetCommandRoute, command)
                        .then(() => scope.$evalAsync(() => scope.placementEnabled = true));
                }
            };

            // ***
            // Move
            // ***
            var moveValetToEndShiftRequest = (dataItem: kendo.data.Model): void => {
                if (!dataItem) return;
                scope.placementEnabled = false;

                var command = new RequestEndShiftCommandDTO();
                command.ID = dataItem.id;
                command.CreatedBy = scope.createdBy;
                self.valetServiceCommand.doCommand(ValetConfiguration_Routing.ValetCommandRoute, command)
                    .then(() => scope.$evalAsync(() => scope.placementEnabled = true));
            };
            var moveAvailableOrGreeterToZone = (dataItem: kendo.data.Model, toRowIndex: number, toColumnIndex: number): void => {
                if (!dataItem) return;
                scope.placementEnabled = false;

                dataItem.set("AssignedZoneStartTimeStamp", null); // So old time won't display while waiting on update
                scope.zoneGreeterListDataSources[toRowIndex][toColumnIndex].add(dataItem);

                var command = new PlaceValetIntoZoneCommandDTO();
                command.ID = dataItem.id;
                command.CreatedBy = scope.createdBy;
                command.Zone = scope.zones[toRowIndex][toColumnIndex];
                self.valetServiceCommand.doCommand(ValetConfiguration_Routing.ValetCommandRoute, command)
                    .then(() => {
                        scope.$evalAsync(() => scope.placementEnabled = true);

                        scope.availableListDataSource.read();
                        scope.greeterListDataSource.read();
                        scope.zoneGreeterListDataSources[toRowIndex][toColumnIndex].read();
                    });
            };
            var moveAvailableToRunnerList = (dataItem: kendo.data.Model): void => {
                if (!dataItem) return;
                scope.placementEnabled = false;

                var command = new MakeARunnerCommandDTO();
                command.ID = dataItem.id;
                command.CreatedBy = scope.createdBy;
                self.valetServiceCommand.doCommand(ValetConfiguration_Routing.ValetCommandRoute, command)
                    .then(() => scope.$evalAsync(() => scope.placementEnabled = true));
            }
            var moveZoneGreeterToDifferentZone = (dataItem: kendo.data.Model, toRowIndex: number, toColumnIndex: number): void => {
                if (!dataItem) return;
                scope.placementEnabled = false;

                scope.zoneGreeterListDataSources[scope.dragRowIndex][scope.dragColumnIndex].remove(dataItem);
                dataItem.set("AssignedZoneStartTimeStamp", null); // So old time won't display while waiting on update
                scope.zoneGreeterListDataSources[toRowIndex][toColumnIndex].add(dataItem);

                var removeCommand = new RemoveGreeterFromZoneCommandDTO();
                removeCommand.ID = dataItem.id;
                removeCommand.CreatedBy = scope.createdBy;
                removeCommand.ZoneIDRemovedFrom = scope.zones[scope.dragRowIndex][scope.dragColumnIndex].ID;

                var placeCommand = new PlaceValetIntoZoneCommandDTO();
                placeCommand.ID = dataItem.id;
                placeCommand.CreatedBy = scope.createdBy;
                placeCommand.Zone = scope.zones[toRowIndex][toColumnIndex];

                var command = new MoveGreeterFromZoneToZoneDTO();
                command.RemoveCommand = removeCommand;
                command.PlaceCommand = placeCommand;

                self.valetServiceCommand.moveGreeterFromZoneToZone(ValetConfiguration_Routing.ValetCommandRoute, command)
                    .then(() => scope.$evalAsync(() => scope.placementEnabled = true));
            };

            // ***
            // Quick "remove" function to move valet from current zone to available
            // ***
            scope.removeGreeterFromZone = (greeterID: string, zoneID: string, currentZoneColumnIndex: number, currentZoneRowIndex: number, overridePlacementEnabled: boolean): void => {
                // Ng-click still fires even when disabled class is added, so check here
                if (scope.placementEnabled || overridePlacementEnabled) {
                    scope.placementEnabled = false;
                    var command = new RemoveGreeterFromZoneCommandDTO();
                    command.ID = greeterID;
                    command.CreatedBy = scope.createdBy;
                    command.ZoneIDRemovedFrom = zoneID;
                    self.valetServiceCommand.doCommand(ValetConfiguration_Routing.ValetCommandRoute, command)
                        .then(() => {
                            scope.$evalAsync(() => scope.placementEnabled = true);

                            scope.availableListDataSource.read();
                            scope.greeterListDataSource.read();
                            scope.zoneGreeterListDataSources[currentZoneRowIndex][currentZoneColumnIndex].read();
                        });
                }
            };
            scope.removeGreeterFromAllZones = (greeter: any): void => {
                // Ng-click still fires even when disabled class is added, so check here
                if (scope.placementEnabled) {
                    scope.placementEnabled = false;
                    var commands = [];
                    greeter.AssignedZones.forEach((zone) => {
                        var command = new RemoveGreeterFromZoneCommandDTO();
                        command.ID = greeter.ID;
                        command.CreatedBy = scope.createdBy;
                        command.ZoneIDRemovedFrom = zone.ZoneID;
                        commands.push(command);
                    });

                    self.valetServiceCommand.removeGreeterFromMultipleZones(ValetConfiguration_Routing.ValetCommandRoute, commands)
                        .then(() => {
                            scope.$evalAsync(() => scope.placementEnabled = true);

                            scope.availableListDataSource.read();
                            scope.greeterListDataSource.read();
                            scope.refreshData();
                        });
                }
            };
            scope.makeRunnerAvailable = (dataItem: kendo.data.Model): void => {
                scope.placementEnabled = false;
                var dataItemAsModel = dataItem as kendo.data.Model;

                var command = new MakeRunnerAvailableCommandDTO();
                command.ID = dataItemAsModel.id;
                command.CreatedBy = scope.createdBy;
                self.valetServiceCommand.doCommand(ValetConfiguration_Routing.ValetCommandRoute, command)
                    .then(() => scope.$evalAsync(() => scope.placementEnabled = true));
            }


            // *** 
            // Update relevant zones when valet is updated
            // ***
            var getGridLocationsOfZoneElementsValetIsCurrentlyShownIn = (valet): string[] => {
                if (!valet.ID) {
                    return null;
                }

                // Match zone greeter elements that contain valet, extracting zone grid location from element id.
                // Expects element id to be in following format: greeter-[row]X[column]-[valet.ID].
                // Could extract row and column individually, but to simplifiy creating a union without duplicates needed
                // for some operations, extract the "[row]X[column]" part as a single string.
                var regex = new RegExp("greeter-([0-9]?X[0-9]?)-" + valet.ID);
                var gridLocationsOfZoneElementsValetIsCurrentlyShownIn = $('div')
                    .map((i, el) => {
                        var matchedGroups = regex.exec(el.id);
                        if (!!matchedGroups && matchedGroups.length === 2) {
                            // matchedGroups[0] is the full match
                            // matchedGroups[1] is first () group match in regex, the grid "[row]X[column]" part
                            return matchedGroups[1];
                        }
                        return null; // returning null or undefined to jQuery.map removes the item from the result
                    }).toArray();
                return gridLocationsOfZoneElementsValetIsCurrentlyShownIn;
            }
            var getGridLocationsOfZonesValetIsAssignedTo = (valet): string[] => {
                if (!valet.ID) {
                    return null;
                }

                // Get zone grid row and column for zones valet is assigned to, and create grid location to match format
                // used in grid element (i.e. [row]X[column]) to simplifiy creating a union without duplicates needed
                // for some operations.
                var gridLocationOfZonesValetIsAssignedTo = [];
                if (!!valet.AssignedZones && valet.AssignedZones.length > 0) {

                    var assignedZoneIds = valet.AssignedZones.map(z => z.ZoneID);
                    gridLocationOfZonesValetIsAssignedTo = scope.zoneLookupList
                        .filter(zone => !!zone && !!zone.ID && assignedZoneIds.includes(zone.ID))
                        .map(zone => zone.GridRow + "X" + zone.GridColumn);
                }
                return gridLocationOfZonesValetIsAssignedTo;
            }
            var readZonesInGridLocations = (gridLocationOfZonesToRead: string[]) => {
                gridLocationOfZonesToRead.forEach(gridLocation => {
                    var rowColumn = gridLocation.split("X");
                    scope.zoneGreeterListDataSources[rowColumn[0]][rowColumn[1]].read();
                });
            }
            var updateZonesValetIsCurrentlyShownIn = (valet) => {
                readZonesInGridLocations(getGridLocationsOfZoneElementsValetIsCurrentlyShownIn(valet));
            }
            var updateZonesValetIsAssignedTo = (valet) => {
                readZonesInGridLocations(getGridLocationsOfZonesValetIsAssignedTo(valet));
            }

            var updateZonesValetIsCurrentlyShownInOrIsAssignedTo = (valet) => {
                // Create a union without duplicates of zone elements that valet is assigned to or is currently
                // shown in and read those datasources
                var gridLocationUnion = _.union(getGridLocationsOfZoneElementsValetIsCurrentlyShownIn(valet),
                    getGridLocationsOfZonesValetIsAssignedTo(valet));
                readZonesInGridLocations(gridLocationUnion);
            }

            var initializeSignalRHub = () => {
                scope.connection = AppCommon.TicketUtils.initializeSignalRConnection();
                scope.hubTicket = scope.connection.createHubProxy("Ticket");
                scope.hubValet = scope.connection.createHubProxy("Valet");

                scope.hubTicket.on("create",
                    () => {
                        scope.$evalAsync(() => scope.countOfTicketChangesSinceLastRefresh++);
                    });
                scope.hubTicket.on("update",
                    (data) => {
                        scope.countOfTicketChangesSinceLastRefresh++;
                    });
                scope.hubTicket.on("destroy",
                    (data) => {
                        scope.countOfTicketChangesSinceLastRefresh++;
                    });

                scope.hubValet.on("create",
                    (data) => {
                        //chaining requests a little to slow it down - improves performance
                        scope.valetReadyToStartShiftListDataSource.read();
                        scope.valetReadyToEndShiftListDataSource.read().then(() => {
                                scope.availableListDataSource.read();
                                scope.greeterListDataSource.read().then(() => {
                                    scope.runnerListDataSource.read();
                                    updateZonesValetIsAssignedTo(data);
                                });
                            });
                    });
                scope.hubValet.on("update",
                    (data) => {
                        //chaining requests a little to slow it down - improves performance
                        scope.valetReadyToStartShiftListDataSource.read();
                        scope.valetReadyToEndShiftListDataSource.read().then(() => {
                            scope.availableListDataSource.read();
                            scope.greeterListDataSource.read().then(() => {
                                scope.runnerListDataSource.read();
                                updateZonesValetIsAssignedTo(data);
                            });
                        });
                    });
                scope.hubValet.on("destroy",
                    (data) => {
                        scope.valetReadyToStartShiftListDataSource.read();
                        scope.valetReadyToEndShiftListDataSource.read();
                        scope.availableListDataSource.read();
                        scope.greeterListDataSource.read();
                        scope.runnerListDataSource.read();
                        // Deny End Shift triggers a Destroy instead of an Update so need to update AssignedTo zones as well as CurrentlyShownIn
                        updateZonesValetIsCurrentlyShownInOrIsAssignedTo(data);
                    });

                scope.hubStart = scope.connection.start({ jsonp: true })
                    .then(() => {
                        minutesInPlaceThreshold = AppCommon.AppCommonConfig.valetMinutesInPlaceThreshold;
                    });
            }

            // ***
            // Rendering
            // ***
            var startedDraggingSomething = () => {
                scope.$evalAsync(() => scope.draggingSomething = true);
            }
            var stoppedDraggingSomething = () => {
                scope.$evalAsync(() => scope.draggingSomething = false);
                // needed to clear hover effect if drag is canceled; also handles drop
                $(".dropzone-hover").removeClass("dropzone-hover");
            }
            //// drag configuration
            //$(scope.zoneGreeterList[rowIndex][columnIndex].element)
            //    .kendoDraggable({
            //        filter: ".draggable",
            //        dragstart: (e) => {
            //            startedDraggingSomething();
            //            scope.dragColumnIndex = columnIndex;
            //            scope.dragRowIndex = rowIndex;
            //            scope.dragSource = DragSource.Zone;
            //        },
            //        dragend: stoppedDraggingSomething,
            //        dragcancel: stoppedDraggingSomething,
            //        hint: (e) => {
            //            return $(e).find(".valet-element").clone().addClass("dragging").removeClass("width-full");
            //        },
            //        cancelHold: null
            //    });
            var configureDraggable = (
                dragSource: DragSource,
                draggableListView: kendo.ui.ListView,
                sourceRowIndex: number = null,
                sourceColumnIndex: number = null): void => {

                $(draggableListView.element)
                    .kendoDraggable({
                        filter: ".draggable",
                        dragstart: (e) => {
                            startedDraggingSomething();
                            scope.dragRowIndex = sourceRowIndex || -1;
                            scope.dragColumnIndex = sourceColumnIndex || -1;
                            scope.dragSource = dragSource;
                        },
                        dragend: stoppedDraggingSomething,
                        dragcancel: stoppedDraggingSomething,
                        hint: (e) => {
                            return $(e).find(".valet-element").clone().addClass("dragging").removeClass("width-full");
                        },
                        cancelHold: null
                    });
            }
            var getDroppedDataItem = (element: kendo.ui.DropTargetDropEvent): kendo.data.Model => {
                var dataItem: kendo.data.Model = null;
                switch (scope.dragSource) {
                    case DragSource.Available:
                        dataItem = scope.availableListDataSource
                            .getByUid(element.draggable.currentTarget.attr("data-uid"));
                        break;
                    case DragSource.Greeter:
                        dataItem = scope.greeterListDataSource
                            .getByUid(element.draggable.currentTarget.attr("data-uid"));
                        break;
                    case DragSource.Runner:
                        dataItem = scope.runnerListDataSource
                            .getByUid(element.draggable.currentTarget.attr("data-uid"));
                        break;
                    case DragSource.Zone:
                        dataItem = scope.zoneGreeterListDataSources[scope.dragRowIndex][scope.dragColumnIndex]
                            .getByUid(element.draggable.currentTarget.attr("data-uid"));
                        break;
                }
                return dataItem;
            }
            var configureDropTarget = (
                acceptedDragSources: DragSource[],
                dropTargetListView: kendo.ui.ListView,
                dropAction: (dataItem: kendo.data.Model, toRowIndex?: number, toColumnIndex?: number) => void): void => {

                dropTargetListView.wrapper.kendoDropTarget({
                    dragenter: () => {
                        if (!_.includes(acceptedDragSources, scope.dragSource)) return;
                        $(dropTargetListView.element).addClass("dropzone-hover");
                    },
                    dragleave: () => {
                        if (!_.includes(acceptedDragSources, scope.dragSource)) return;
                        $(dropTargetListView.element).removeClass("dropzone-hover");
                    },
                    drop: (e: kendo.ui.DropTargetDropEvent) => {
                        if (!_.includes(acceptedDragSources, scope.dragSource)) {
                            (e as JQueryEventObject).preventDefault(); // snap back
                            return;
                        }
                        var dataItem = getDroppedDataItem(e);
                        dropAction(dataItem);
                    }
                });
            }
            var renderEndShiftList = (): void => {
                if (scope.canPlace) {
                    scope.valetReadyToEndShiftList = $("#valetReadyToEndShiftListView").data("kendoListView");
                    configureDropTarget([DragSource.Available, DragSource.Greeter, DragSource.Runner, DragSource.Zone], scope.valetReadyToEndShiftList, moveValetToEndShiftRequest);
                }
            }
            var renderAvailableList = (): void => {
                if (scope.canPlace) {
                    scope.availableList = $("#availableListView").data("kendoListView");
                    configureDraggable(DragSource.Available, scope.availableList);
                }
            }
            var renderGreeterList = (): void => {
                if (scope.canPlace) {
                    scope.greeterList = $("#greeterListView").data("kendoListView");
                    configureDraggable(DragSource.Greeter, scope.greeterList);
                }
            }
            var renderRunnerList = (): void => {
                if (scope.canPlace) {
                    scope.runnerList = $("#runnerListView").data("kendoListView");
                    configureDraggable(DragSource.Runner, scope.runnerList);
                    configureDropTarget([DragSource.Available], scope.runnerList, moveAvailableToRunnerList);
                }
            }
            var renderZoneGreeterList = (columnIndex: number, rowIndex: number): void => {
                scope.zoneGreeterList[rowIndex][columnIndex] = $(`#zoneGreeterList-${rowIndex}X${columnIndex}`).data("kendoListView");

                if (scope.canPlace) {
                    configureDraggable(DragSource.Zone, scope.zoneGreeterList[rowIndex][columnIndex], rowIndex, columnIndex);

                    // drop configuration
                    var acceptedDragSources = [DragSource.Available, DragSource.Greeter, DragSource.Zone];
                    scope.zoneGreeterList[rowIndex][columnIndex].wrapper.kendoDropTarget({
                        dragenter: (e) => {
                            if (!_.includes(acceptedDragSources, scope.dragSource)) return;
                            if (scope.dragRowIndex === rowIndex && scope.dragColumnIndex === columnIndex) return;   // dropped to source

                            $(scope.zoneGreeterList[rowIndex][columnIndex].element).addClass("dropzone-hover");
                        },
                        dragleave: (e) => {
                            if (!_.includes(acceptedDragSources, scope.dragSource)) return;
                            if (scope.dragRowIndex === rowIndex && scope.dragColumnIndex === columnIndex) return;   // dropped to source

                            $(scope.zoneGreeterList[rowIndex][columnIndex].element).removeClass("dropzone-hover");
                        },
                        drop: (e) => {
                            if (!_.includes(acceptedDragSources, scope.dragSource)) return;
                            if (scope.dragRowIndex === rowIndex && scope.dragColumnIndex === columnIndex) return;   // dropped to source
                            var dataItem = getDroppedDataItem(e);
                            switch (scope.dragSource) {
                                case DragSource.Available:
                                case DragSource.Greeter:
                                    moveAvailableOrGreeterToZone(dataItem, rowIndex, columnIndex);
                                    break;
                                case DragSource.Zone:
                                    moveZoneGreeterToDifferentZone(dataItem, rowIndex, columnIndex);
                                    break;
                            }
                        }
                    });
                }
            };

            // ***
            // Bind to a function work-around "Closure on a variable modified in loop of 
            // outer scope" problem that occurs when need to access an array element when
            // a promise is resolved.
            // ***
            var updateZoneDataFuncs: Function[][];
            var updateZoneData = (columnIndex: number, rowIndex: number): void => {
                //console.log(`updateZoneData row ${rowIndex} column ${columnIndex}`);
                if (scope.zoneGreeterListDataSources[rowIndex][columnIndex] != null) {
                    scope.zoneGreeterListDataSources[rowIndex][columnIndex].read();
                }

                var zoneID = scope.zones[rowIndex][columnIndex].ID;
                if (!!zoneID) {
                    var currentDispatchParameters = new DispatchParameters();
                    currentDispatchParameters.OperatingLocationID = scope.selectedOperatingLocation.ID;
                    currentDispatchParameters.FromDateTime = scope.filterFromDateTime;
                    currentDispatchParameters.ToDateTime = scope.filterToDateTime;
                    currentDispatchParameters.ZoneID = zoneID;

                    scope.departureSources[rowIndex][columnIndex] = self.kendoDataSourceService.getDataSourceWithDispatchParameters(ValetConfiguration_Routing.DispatcherAirportTicketRoute, ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetDepartureQueueByZone, currentDispatchParameters);
                    scope.returnSources[rowIndex][columnIndex] = self.kendoDataSourceService.getDataSourceWithDispatchParameters(ValetConfiguration_Routing.DispatcherAirportTicketRoute, ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetReturnQueueByZone, currentDispatchParameters);
                    scope.capturedSources[rowIndex][columnIndex] = self.kendoDataSourceService.getDataSource(ValetConfiguration_Routing.DispatcherAirportTicketRoute, ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetCapturedQueueByZone, zoneID);
                    scope.tolltagSources[rowIndex][columnIndex] = self.kendoDataSourceService.getDataSource(ValetConfiguration_Routing.DispatcherAirportTicketRoute, ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetCapturedQueueByZone, zoneID);
                    scope.tolltagSources[rowIndex][columnIndex].filter({ field: "UseTollTag", operator: "eq", value: 1 });


                    if (scope.departureSources[rowIndex][columnIndex] != null) {
                        scope.departureSources[rowIndex][columnIndex].read().then(() => {
                            scope.$evalAsync(() => {
                                scope.departureCounts[rowIndex][columnIndex] = scope.departureSources[rowIndex][columnIndex].total();
                            });
                        });
                    }

                    if (scope.returnSources[rowIndex][columnIndex] != null) {
                        scope.returnSources[rowIndex][columnIndex].read().then(() => {
                            scope.$evalAsync(() => {
                                scope.returnCounts[rowIndex][columnIndex] = scope.returnSources[rowIndex][columnIndex].total();
                            });
                        });
                    }

                    if (scope.capturedSources[rowIndex][columnIndex] != null) {
                        scope.capturedSources[rowIndex][columnIndex].read().then(() => {
                            scope.$evalAsync(() => {
                                scope.capturedCounts[rowIndex][columnIndex] = scope.capturedSources[rowIndex][columnIndex].total();
                            });
                            if (scope.tolltagSources[rowIndex][columnIndex] != null) {
                                scope.tolltagSources[rowIndex][columnIndex].read().then(() => {
                                    scope.$evalAsync(() => {
                                        scope.tolltagCounts[rowIndex][columnIndex] = scope.tolltagSources[rowIndex][columnIndex].total();
                                        scope.nonTolltagCounts[rowIndex][columnIndex] = scope.capturedCounts[rowIndex][columnIndex] - scope.tolltagCounts[rowIndex][columnIndex];
                                    });
                                });
                            }
                        });
                    }
                }
            }
            var updateNoZoneData = (): void => {
                //console.log("updateNoZoneData");
                var noZoneDispatchParameters = new DispatchParameters();
                noZoneDispatchParameters.OperatingLocationID = scope.selectedOperatingLocation.ID;
                noZoneDispatchParameters.FromDateTime = scope.filterFromDateTime;
                noZoneDispatchParameters.ToDateTime = scope.filterToDateTime;

                scope.noZoneDepartureSource = self.kendoDataSourceService.getDataSourceWithDispatchParameters(ValetConfiguration_Routing.DispatcherAirportTicketRoute, ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetDepartureQueueWithNullZone, noZoneDispatchParameters);
                scope.noZoneReturnSource = self.kendoDataSourceService.getDataSourceWithDispatchParameters(ValetConfiguration_Routing.DispatcherAirportTicketRoute, ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetReturnQueueWithNullZone, noZoneDispatchParameters);
                scope.noZoneCapturedSource = self.kendoDataSourceService.getDataSource(ValetConfiguration_Routing.DispatcherAirportTicketRoute, ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetCapturedQueueWithNullZone, scope.selectedOperatingLocation.ID);

                if (scope.noZoneDepartureSource != null) {
                    scope.noZoneDepartureSource.read().then(() => {
                        scope.$evalAsync(() => {
                            scope.noZoneDepartureCount = scope.noZoneDepartureSource.total();
                        });
                    });
                }
                if (scope.noZoneReturnSource != null) {
                    scope.noZoneReturnSource.read().then(() => {
                        scope.$evalAsync(() => {
                            scope.noZoneReturnCount = scope.noZoneReturnSource.total();
                        });
                    });
                }
                if (scope.noZoneCapturedSource != null) {
                    scope.noZoneCapturedSource.read().then(() => {
                        scope.$evalAsync(() => {
                            scope.noZoneCapturedCount = scope.noZoneCapturedSource.total();
                        });
                    });
                }
            }

            // ***
            // Events
            // ***
            scope.onFinishRender = (rowIndex: number): void => {
                // on-finish-render directive is within an inner ng-repeat; only continue once last row has rendered
                if (rowIndex + 1 !== scope.zonesNumberOfRows) {
                    return;
                }
                //console.log("onFinishRender");

                // Zone initialization
                for (let rowIndex = 0; rowIndex < scope.zonesNumberOfRows; rowIndex++) {
                    for (let columnIndex = 0; columnIndex < scope.zonesNumberOfColumns; columnIndex++) {
                        if (!!scope.zoneGreeterListDataSources[rowIndex][columnIndex]) {  //only allow cells with zones to initialize
                            renderZoneGreeterList(columnIndex, rowIndex);
                            updateZoneDataFuncs[rowIndex][columnIndex] = updateZoneData.bind(this, columnIndex, rowIndex); // bind function for later use
                            updateZoneDataFuncs[rowIndex][columnIndex]();
                        } else {
                            updateZoneDataFuncs[rowIndex][columnIndex] = () => 0;
                        }
                    }
                }

                updateNoZoneData();

                renderEndShiftList();
                renderAvailableList();
                renderGreeterList();
                renderRunnerList();
            };

            scope.onChangeOperatingLocation = (newOperatingLocation: OperatingLocationDTO): void => {

                scope.selectedOperatingLocation = newOperatingLocation;

                scope.zoneLookupList = null;
                scope.zones = null;
                scope.zoneGreeterListDataSources = [];
                scope.zoneGreeterList = [];
                scope.departureSources = [];
                scope.departureCounts = [];
                scope.returnSources = [];
                scope.returnCounts = [];
                scope.capturedSources = [];
                scope.capturedCounts = [];
                scope.tolltagSources = [];
                scope.tolltagCounts = [];
                scope.nonTolltagCounts = [];
                updateZoneDataFuncs = [];
                scope.zonesNumberOfRows = 0;
                scope.zonesNumberOfColumns = 0;

                scope.noZoneDepartureCount = 0;
                scope.noZoneDepartureSource = null;
                scope.noZoneReturnCount = 0;
                scope.noZoneReturnSource = null;
                scope.noZoneCapturedCount = 0;
                scope.noZoneCapturedSource = null;

                if (scope.selectedOperatingLocation == null || typeof scope.selectedOperatingLocation == "undefined") return;

                //get tickets with no zone
                var noZoneDispatchParameters = new DispatchParameters();
                noZoneDispatchParameters.OperatingLocationID = scope.selectedOperatingLocation.ID;
                noZoneDispatchParameters.FromDateTime = scope.filterFromDateTime;
                noZoneDispatchParameters.ToDateTime = scope.filterToDateTime;

                scope.noZoneDepartureSource = self.kendoDataSourceService.getDataSourceWithDispatchParameters(ValetConfiguration_Routing.DispatcherAirportTicketRoute, ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetDepartureQueueWithNullZone, noZoneDispatchParameters);
                scope.noZoneReturnSource = self.kendoDataSourceService.getDataSourceWithDispatchParameters(ValetConfiguration_Routing.DispatcherAirportTicketRoute, ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetReturnQueueWithNullZone, noZoneDispatchParameters);
                scope.noZoneCapturedSource = self.kendoDataSourceService.getDataSource(ValetConfiguration_Routing.DispatcherAirportTicketRoute, ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetCapturedQueueWithNullZone, scope.selectedOperatingLocation.ID);


                this.zoneRepository.getByOperatingLocationIDAsMatrix(scope.selectedOperatingLocation.ID)
                    .then(resultZones => {

                        scope.zones = resultZones;
                        scope.zoneLookupList = [].concat.apply([], resultZones);

                        // Initialize data sources
                        for (let rowIndex = 0; rowIndex < scope.zones.length; rowIndex++ , ++scope.zonesNumberOfRows) {
                            scope.zoneGreeterListDataSources[rowIndex] = [];
                            scope.zoneGreeterList[rowIndex] = [];
                            scope.departureSources[rowIndex] = [];
                            scope.departureCounts[rowIndex] = [];
                            scope.returnSources[rowIndex] = [];
                            scope.returnCounts[rowIndex] = [];
                            scope.capturedSources[rowIndex] = [];
                            scope.capturedCounts[rowIndex] = [];
                            scope.tolltagSources[rowIndex] = [];
                            scope.tolltagCounts[rowIndex] = [];
                            scope.nonTolltagCounts[rowIndex] = [];
                            updateZoneDataFuncs[rowIndex] = [];

                            for (let columnIndex = 0; columnIndex < scope.zones[rowIndex].length; columnIndex++) {
                                if (scope.zones[rowIndex][columnIndex] != null && scope.zones[rowIndex][columnIndex].ID != null && scope.zones[rowIndex][columnIndex].ID.length > 0) {
                                    var zoneID = scope.zones[rowIndex][columnIndex].ID;
                                    if (!!zoneID) {
                                        //console.log(`initializeZoneData row ${rowIndex} column ${columnIndex}`);

                                        var currentDispatchParameters = new DispatchParameters();
                                        currentDispatchParameters.OperatingLocationID = scope.selectedOperatingLocation.ID;
                                        currentDispatchParameters.FromDateTime = scope.filterFromDateTime;
                                        currentDispatchParameters.ToDateTime = scope.filterToDateTime;
                                        currentDispatchParameters.ZoneID = zoneID;

                                        scope.departureSources[rowIndex][columnIndex] = self.kendoDataSourceService.getDataSourceWithDispatchParameters(ValetConfiguration_Routing.DispatcherAirportTicketRoute, ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetDepartureQueueByZone, currentDispatchParameters);
                                        scope.departureSources[rowIndex][columnIndex].sort({ field: "DateTimeCustomerMeetsValet", dir: "asc" });
                                        scope.returnSources[rowIndex][columnIndex] = self.kendoDataSourceService.getDataSourceWithDispatchParameters(ValetConfiguration_Routing.DispatcherAirportTicketRoute, ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetReturnQueueByZone, currentDispatchParameters);
                                        scope.returnSources[rowIndex][columnIndex].sort({ field: "DateTimeCustomerMeetsValet", dir: "asc" });
                                        scope.capturedSources[rowIndex][columnIndex] = self.kendoDataSourceService.getDataSource(ValetConfiguration_Routing.DispatcherAirportTicketRoute, ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetCapturedQueueByZone, zoneID);
                                        scope.capturedSources[rowIndex][columnIndex].sort({ field: "DateTimeCustomerMeetsValet", dir: "asc" });
                                        scope.tolltagSources[rowIndex][columnIndex] = self.kendoDataSourceService.getDataSource(ValetConfiguration_Routing.DispatcherAirportTicketRoute, ValetConfiguration_Routing_DispatcherAirportTicketMethods.GetCapturedQueueByZone, zoneID);
                                        scope.tolltagSources[rowIndex][columnIndex].filter({ field: "UseTollTag", operator: "eq", value: 1 });
                                        scope.zoneGreeterListDataSources[rowIndex][columnIndex] = self.kendoDataSourceService.getDataSource(ValetConfiguration_Routing.ValetRoute, ValetConfiguration_Routing_ValetMethods.GetGreetersByZone, zoneID, null, null, AppCommon.ValetUtils.valetParseFunction);
                                    }
                                }

                                if (columnIndex >= scope.zonesNumberOfColumns) {
                                    scope.zonesNumberOfColumns = columnIndex + 1;
                                }
                            }
                        }

                        scope.availableListDataSource = self.kendoDataSourceService.getDataSource(
                            ValetConfiguration_Routing.ValetRoute,
                            ValetConfiguration_Routing_ValetMethods.GetAvailableByOperatingLocationID,
                            scope.selectedOperatingLocation.ID,
                            null,
                            null,
                            AppCommon.ValetUtils.valetParseFunction
                        );

                        scope.greeterListDataSource = self.kendoDataSourceService.getDataSource(
                            ValetConfiguration_Routing.ValetRoute,
                            ValetConfiguration_Routing_ValetMethods.GetGreetersByOperatingLocationID,
                            scope.selectedOperatingLocation.ID,
                            null,
                            null,
                            AppCommon.ValetUtils.valetParseFunction
                        );

                        var dispatchParameters = new DispatchParameters();
                        dispatchParameters.OperatingLocationID = scope.selectedOperatingLocation.ID;
                        dispatchParameters.FromDateTime = scope.filterFromDateTime;
                        dispatchParameters.ToDateTime = scope.filterToDateTime;
                        var runnerListDataSourceOptions = self.kendoDataSourceService.getSignalrDataSource(
                            scope.hubValet,
                            scope.hubStart,
                            dispatchParameters,
                            "ReadRunner"
                        );
                        runnerListDataSourceOptions.schema.parse = AppCommon.ValetUtils.valetParseFunction;
                        scope.runnerListDataSource = new kendo.data.DataSource(runnerListDataSourceOptions);
                        scope.runnerListOptions =
                            {
                                dataSource: scope.runnerListDataSource
                            };

                        scope.valetReadyToStartShiftListDataSource = self.kendoDataSourceService.getDataSource(
                            ValetConfiguration_Routing.ValetRoute,
                            ValetConfiguration_Routing_ValetMethods.GetValetsRequestingShiftStartByOperatingLocationID,
                            scope.selectedOperatingLocation.ID,
                            null,
                            null,
                            AppCommon.ValetUtils.valetParseFunction);

                        scope.valetReadyToEndShiftListDataSource = self.kendoDataSourceService.getDataSource(
                            ValetConfiguration_Routing.ValetRoute,
                            ValetConfiguration_Routing_ValetMethods.GetValetsRequestingShiftEndByOperatingLocationID,
                            scope.selectedOperatingLocation.ID,
                            null,
                            null,
                            AppCommon.ValetUtils.valetParseFunction);

                        scope.refreshButtonCounterDataSource = new kendo.data.DataSource(
                            self.kendoDataSourceService.getSignalrDataSource(scope.hubTicket, scope.hubStart, dispatchParameters));
                    });
            };

            // ***
            // Button Commands
            // ***
            scope.refreshData = (): void => {
                scope.countOfTicketChangesSinceLastRefresh = 0;
                scope.$evalAsync(() => {
                    for (let rowIndex = 0; rowIndex < scope.zonesNumberOfRows; rowIndex++) {
                        for (let columnIndex = 0; columnIndex < scope.zonesNumberOfColumns; columnIndex++) {
                            updateZoneDataFuncs[rowIndex][columnIndex]();
                        }
                    }
                    updateNoZoneData();

                    scope.availableListDataSource.read();
                    scope.greeterListDataSource.read();
                    scope.runnerListDataSource.read();
                    scope.valetReadyToStartShiftListDataSource.read();
                    scope.valetReadyToEndShiftListDataSource.read();
                }
                );
            };
            scope.applyDateFilter = (): void => {
                if (!!scope.filterFromDateTime && !!scope.filterToDateTime) {
                    scope.refreshData();
                }
            };

            scope.toggleTicketDetails = (): void => {
                scope.showTicketDetails = !scope.showTicketDetails;
            }

            // 
            // Body
            //
            scope.countOfTicketChangesSinceLastRefresh = 0;
            initializeSignalRHub();
        };
    }

    angular.module("app.staff")
        .directive("valetPlacement",
        [
            "$window", "$state", "$rootScope", "SessionService", "SystemConfigurationService", "KendoDataSourceService", "ValetServiceCommand", "ZoneRepository", "DefinedListRepository",
            (w, s, rs, ss, c, k, v, z, dl) => new ValetPlacementDirective(w, s, rs, ss, c, k, v, z, dl)
        ]);
}