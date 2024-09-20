module AppCommon {
    export class TrackingMapController extends ControllerBase {
        mapImageUrl: string;
        canvas: HTMLCanvasElement;
        canvasContext: CanvasRenderingContext2D;
        trackingIcon: HTMLImageElement;
        timer: ng.IPromise<any>;
        employees: ResourceLastKnownLocationForMapDTO[];

        static $inject = ["$interval", "AuthService", "MapRepository", "ResourceLastKnownLocationForMapRepository"];

        constructor(
            private interval: ng.IIntervalService,
            private authService: AuthService,
            private mapRepository: AppCommon.MapRepository,
            private resourceLastKnownLocationForMapRepository: AppCommon.ResourceLastKnownLocationForMapRepository
        ) {
            super(authService);

            this.canvas = (document.getElementById("mapCanvas")) as HTMLCanvasElement;
            this.canvasContext = this.canvas.getContext("2d");
            this.trackingIcon = document.getElementById("trackingIcon") as HTMLImageElement;
        }

        loadMap(operatingLocation: OperatingLocationDTO): void {
            //clear everything first
            this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (angular.isDefined(this.timer)) {
                this.interval.cancel(this.timer);
                this.timer = undefined;
            }

            //set up the map and timer
            this.mapRepository.fetch(operatingLocation.ID, AppConfig.APIHOST)
                .then(data => {
                    if (!!data) {
                        if (data.length > 0) {
                            var firstMapOnlyForNow = data[0];
                            this.mapImageUrl = firstMapOnlyForNow.ImageUrl;
                            this.timer = this.interval(() => this.loadValetLocations(firstMapOnlyForNow.ID), 4000);
                            
                        } else {
                            this.mapImageUrl = null;
                        }
                    }
                });
        }

        loadValetLocations(mapID: string): void {
            this.resourceLastKnownLocationForMapRepository.fetch(mapID, AppConfig.APIHOST)
                .then(data => {
                    if (!!data) {
                        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
                        this.employees = data;
                        for (var i = 0; i < data.length; i++) {
                            this.plotValetOnMap(data[i]);
                        }
                    }
                });
        }

        plotValetOnMap(valetLastKnownLocation: ResourceLastKnownLocationForMapDTO): void {
            var posX = valetLastKnownLocation.PositionXY.X - 10;
            var posY = valetLastKnownLocation.PositionXY.Y - 10;
            this.canvasContext.drawImage(this.trackingIcon, posX, posY);
            var tipRegion = { x: posX, y: posY, w: 20, h: 20 };
            var tipText = "<div style='font-size:larger'>" +
                valetLastKnownLocation.ResourceFriendlyID +
                "</div><div><i>" +
                valetLastKnownLocation.GeoLocation.Latitude +
                ", " +
                valetLastKnownLocation.GeoLocation.Longitude +
                "</i></div><div>";
            if (valetLastKnownLocation.DeviceCode != null)
            {
                tipText += "<b>" +
                    valetLastKnownLocation.DeviceCode + "</b>: ";
            }
            if (valetLastKnownLocation.Note != null) {
                tipText += valetLastKnownLocation.Note;
            }
            tipText += "</div><div>" +
                "Reported On " + valetLastKnownLocation.LocationReportedOn +
                "</div>";
            var t1 = this.toolTip(this.canvas, tipRegion, tipText, 200, 5000);
        }

        //From: http://stackoverflow.com/questions/29489468/popup-tooltip-for-rectangular-region-drawn-in-canvas/29490892#29490892
        toolTip(canvas, region, text, width, timeout): void {

            var me = this, // self-reference for event handlers
                div = document.createElement("div"), // the tool-tip div
                parent = canvas.parentNode, // parent node for canvas
                visible = false; // current status

            // set some initial styles, can be replaced by class-name etc.
            div.style.cssText = "position:fixed;padding:7px;background:gold;pointer-events:none;width:" + width + "px";
            div.innerHTML = text;

            // show the tool-tip
            var show = function(pos) {
                if (!visible) { // ignore if already shown (or reset time)
                    visible = true; // lock so it's only shown once
                    setDivPos(pos); // set position
                    parent.appendChild(div); // add to parent of canvas
                    setTimeout(hide, timeout); // timeout for hide
                }
            }

            // hide the tool-tip
            function hide() {
                visible = false; // hide it after timeout
                parent.removeChild(div); // remove from DOM
            }

            // check mouse position, add limits as wanted... just for example:
            function check(e) {
                var pos = getPos(e),
                    posAbs = { x: e.clientX, y: e.clientY }; // div is fixed, so use clientX/Y

                if (!visible &&
                    pos.x >= region.x &&
                    pos.x < region.x + region.w &&
                    pos.y >= region.y &&
                    pos.y < region.y + region.h) {
                    show(posAbs); // show tool-tip at this pos

                }
            }

            // get mouse position relative to canvas
            function getPos(e) {
                var r = canvas.getBoundingClientRect();
                return { x: e.clientX - r.left, y: e.clientY - r.top }
            }

            // update and adjust div position if needed (anchor to a different corner etc.)
            function setDivPos(pos) {
                if (visible) {
                    if (pos.x < 0) pos.x = 0;
                    if (pos.y < 0) pos.y = 0;
                    // other bound checks here
                    div.style.left = pos.x + "px";
                    div.style.top = pos.y + "px";
                }
            }

            // we need to use shared event handlers:
            //canvas.addEventListener("mousemove", check);
            canvas.addEventListener("click", check);

        }
    }

    angular.module("app.common")
        .controller("TrackingMapController",
        ["$interval", "AuthService", "MapRepository", "ResourceLastKnownLocationForMapRepository",
                (i, auth, m, rlkl) => new TrackingMapController(i, auth, m, rlkl)
        ]);
}