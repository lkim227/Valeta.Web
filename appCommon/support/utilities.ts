module AppCommon {
    import Data = kendo.data;

    export class GenericUtils {
        static getBooleanAttribute = (attrValue) => (attrValue === "" || attrValue === "true" || attrValue === true);
        static camelToTitle = (camelStr: string): string => {
            if (!camelStr || camelStr.length <= 0) {
                return null;
            }
            return (camelStr.charAt(0).toUpperCase() + camelStr.slice(1)).split(/(?=[A-Z])/).join(" ");
        }
        static camelToLower = (camelStr: string): string => {
            if (!camelStr || camelStr.length <= 0) {
                return null;
            }
            return (GenericUtils.camelToTitle(camelStr)).toLowerCase();
        }
        static cloneObject = (obj: any): any => {
            return angular.copy(obj);
        }
        static parseJSON = (content: string): Object => {
            try {
                var obj = JSON.parse(content);
                if (obj && typeof obj === "object") {
                    return obj;
                }
                return undefined;
            } catch (e) {
                return undefined;
            }
        }
        static isUndefinedNullEmptyOrWhiteSpace = (s: string): boolean => {
            // Have to convert s toString before trim else it will fail if s is 0
            return (typeof s === "undefined" || s === null || s.toString().trim() === ""); 
        }
        static isUndefinedNullOrEmpty = (s: string): boolean => {
            return (typeof s === "undefined" || s === null || s.length === 0);
        }
        static isUndefinedOrNull = (o: any): boolean => {
            return (typeof o === "undefined" || o === null);
        }
        static phoneNumToUSFormat = (): Function => {
            return function (tel) {
                if (!tel) { return '' }

                var value = tel.toString().trim().replace(/^\+/, '');

                if (value.match(/[^0-9]/)) {
                    return tel;
                }

                var country, city, phonenum;

                switch (value.length) {
                    case 10: //  +C ###-#### 
                        country = 1;
                        city = value.slice(0, 3);
                        phonenum = value.slice(3);
                        break;

                    case 11: // +C ###-####
                        country = value[0];
                        city = value.slice(1, 4);
                        phonenum = value.slice(4);
                        break;

                    case 12: //  +CCC ###-####
                        country = value.slice(0, 3);
                        city = value.slice(3, 5);
                        phonenum = value.slice(5);
                        break;

                    default:
                        return tel;
                }

                // ignores +1 US country code            
                if (country == 1) {
                    country = "";
                }
                else {
                    country = "+" + country;
                }

                phonenum = phonenum.slice(0, 3) + '-' + phonenum.slice(3);

                const formattedTel = (country + " (" + city + ") " + phonenum).trim();
                return formattedTel;
            }
        }
        static getFileFromUri = (uri: string): any => {
            // ImageDataURI --> File     
            if (uri != '' && uri.split(',')[0].indexOf('base64') >= 0) {
                // convert base64/URLEncoded data component to raw binary data held in a string
                var byteString = atob(uri.split(',')[1]);
                var mimeString = uri.split(',')[0].split(':')[1].split(';')[0];

                // create ArrayBuffer
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }

                return new Blob([ab], { type: mimeString });
            }
            else {
                return null;
            }
        }
    }

    // ReSharper disable once InconsistentNaming
    export class IESafeUtils {
        static arrayFind = (arrayToSearch: any[], testFunction: (x: any) => boolean, scopeContext: any): any => {
            // e.g., arrayFind(myArray, x => x.Name === findName, this)
            // https://stackoverflow.com/questions/10457264/how-to-find-first-element-of-array-matching-a-boolean-condition-in-javascript/18520276#18520276
            var result; // do not give an initial value so that it has same behavior as Array.prototype.find()
            arrayToSearch.some((element, index) => testFunction.call(scopeContext, element, index, arrayToSearch) ? ((result = element), true) : false);
            return result;
        }
        static arrayFindIndex = (arrayToSearch: any[], testFunction: (x: any) => boolean, scopeContext: any): number => {
            var result = -1;
            if (arrayToSearch.length > 0 && !!arrayToSearch[0]) {
                arrayToSearch.some((element, index) => testFunction.call(scopeContext, element, index, arrayToSearch) ? ((result = index), true) : false);
            }
            return result;
        }
        static stringStartsWith = (stringToSearch, searchValue): boolean => {
            // https://stackoverflow.com/questions/646628/how-to-check-if-a-string-startswith-another-string/4579228#4579228
            return stringToSearch.lastIndexOf(searchValue, 0) === 0;
        }
        static isInteger = (valueToTest): boolean => {
            return (typeof valueToTest === 'number' && (valueToTest % 1) === 0);
        }
    }

    export class ListViewUtils {
        // Expects a span element with id=sortField+"sort-indicator" to display up/down indicator
        // e.g. <span id="TicketNumber-sort-indicator"></span>
        private static ascendedSortClasses = "k-icon k-i-arrow-n left-buffer5 bottom-buffer5";
        private static descendedSortClasses = "k-icon k-i-arrow-s left-buffer5 bottom-buffer5";
        private currentSortField = null;
        private currentSortIsAscending = false;
        public sortOnField = (dataSource: kendo.data.DataSource, newSortField: string) => {
            if (!newSortField) return;
            var sortIndicatorElement = $(`#${this.currentSortField}-sort-indicator`);
            if (!!sortIndicatorElement) {
                sortIndicatorElement.removeClass(this.currentSortIsAscending ? ListViewUtils.ascendedSortClasses : ListViewUtils.descendedSortClasses);
            }

            if (this.currentSortField === newSortField) {
                this.currentSortIsAscending = !this.currentSortIsAscending;
            } else {
                this.currentSortField = newSortField;
                this.currentSortIsAscending = true;
            }

            sortIndicatorElement = $(`#${this.currentSortField}-sort-indicator`);
            if (!!sortIndicatorElement) {
                sortIndicatorElement.addClass(this.currentSortIsAscending ? ListViewUtils.ascendedSortClasses : ListViewUtils.descendedSortClasses);
            }
            dataSource.sort({ field: this.currentSortField, dir: this.currentSortIsAscending ? "asc" : "desc" });
        }
    }

    export class DebugUtils {
        static stringifyCircularObject = (obj: any): string => {
            // Very helpful for debugging DOM and other circular objects that trigger 
            // "Converting circular structure to JSON" error with JSON.stringify.
            // Please leave here even if not currently used.
            var cache = [];
            return JSON.stringify(obj, (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                        // Circular reference found, discard key
                        return null;
                    }
                    // Store value in our collection
                    cache.push(value);
                }
                return value;
            });
        }
    }

    export class EnumUtils {
        static getTitlesAndValues<T extends number>(e: any) {
            return EnumUtils.getNames(e).map(n => ({ name: GenericUtils.camelToTitle(n), value: e[n] as T }));
        }

        static getNamesAndValues<T extends number>(e: any) {
            return EnumUtils.getNames(e).map(n => ({ name: n, value: e[n] as T }));
        }

        static getNames(e: any) {
            return EnumUtils.getObjValues(e).filter(obj => typeof obj === 'string') as string[];
        }

        static getValues<T extends number>(e: any) {
            return EnumUtils.getObjValues(e).filter(obj => typeof obj === 'number') as T[];
        }

        private static getObjValues(e: any): (number | string)[] {
            return Object.keys(e).map(k => e[k]);
        }

        //specific enums
        static getNameForValueReservationStatus(ndx: number): string {
            var toString = ReservationStatus[ndx];
            return (typeof (toString) == "undefined") ? null : GenericUtils.camelToTitle(toString);
        }
        static getNameForValueServiceTaskStatus(v: number) {
            var enumType = ServiceTaskStatus;
            var names = EnumUtils.getNames(enumType).map(n => ({ name: n, value: enumType[n] }));
            var currentName = names.filter(x => x.value === v);
            if (!!currentName && currentName.length > 0) return currentName[0].name;
            return "";
        }
        static getNameForValueIssueStatus(v: number) {
            var enumType = IssueStatus;
            var names = EnumUtils.getNames(enumType).map(n => ({ name: n, value: enumType[n] }));
            var currentName = names.filter(x => x.value === v);
            if (!!currentName && currentName.length > 0) return currentName[0].name;
            return "";
        }
        static getNameForValueAccessLevel(v: number) {
            var enumType = AccessLevel;
            var names = EnumUtils.getNames(enumType).map(n => ({ name: n, value: enumType[n] }));
            var currentName = names.filter(x => x.value === v);
            if (!!currentName && currentName.length > 0) return currentName[0].name;
            return "";
        }
        static issueStatusToTitle(ndx: number): string {
            var toString = IssueStatus[ndx];
            return (typeof (toString) == "undefined") ? null : GenericUtils.camelToTitle(toString);
        }
        static paymentStatusToTitle(ndx: number): string {
            var toString = PaymentStatus[ndx];
            return (typeof (toString) == "undefined") ? null : GenericUtils.camelToTitle(toString);
        }
        static getNameForValueMessageType(v: number): string {
            var enumType = MessageType;
            var names = EnumUtils.getNames(enumType).map(n => ({ name: n, value: enumType[n] }));
            var currentName = names.filter(x => x.value === v);
            if (!!currentName && currentName.length > 0) return currentName[0].name;
            return "";
        }
        static getNameForValuePromotionAppliesTo(v: number): string {
            var enumType = PromotionAppliesTo;
            var names = EnumUtils.getNames(enumType).map(n => ({ name: n, value: enumType[n] }));
            var currentName = names.filter(x => x.value === v);
            if (!!currentName && currentName.length > 0) return currentName[0].name;
            return "";
        }
        static getNameForValuePointsAccountingStatus(v: number): string {
            var enumType = PointsAccountingStatus;
            var names = EnumUtils.getNames(enumType).map(n => ({ name: n, value: enumType[n] }));
            var currentName = names.filter(x => x.value === v);
            if (!!currentName && currentName.length > 0) return currentName[0].name;
            return "";
        }
        static getNameForValueRewardAppliesTo(v: number): string {
            var enumType = RewardAppliesTo;
            var names = EnumUtils.getNames(enumType).map(n => ({ name: n, value: enumType[n] }));
            var currentName = names.filter(x => x.value === v);
            if (!!currentName && currentName.length > 0) return currentName[0].name;
            return "";
        }
        static getNameForTimesheetStatus(v: number): string {
            var enumType = TimesheetStatus;
            var names = EnumUtils.getNames(enumType).map(n => ({ name: n, value: enumType[n] }));
            var currentName = names.filter(x => x.value === v);
            if (!!currentName && currentName.length > 0) return currentName[0].name;
            return "";
        }
        static getNameForCalculationFormulaType(v: number): string {
            var enumType = CalculationFormulaType;
            var names = EnumUtils.getNames(enumType).map(n => ({ name: n, value: enumType[n] }));
            var currentName = names.filter(x => x.value === v);
            if (!!currentName && currentName.length > 0) return currentName[0].name;
            return "";
        }
        static getNameForTicketStatus(v: number): string {
            var enumType = TicketStatus;
            var names = EnumUtils.getNames(enumType).map(n => ({ name: n, value: enumType[n] }));
            var currentName = names.filter(x => x.value === v);
            if (!!currentName && currentName.length > 0) return currentName[0].name;
            return "";
        }
    }

    export class TicketUtils {
        static isTicketActive(ticketStatus: TicketStatus): boolean {
            return ticketStatus <= TicketStatus.CannotClose || ticketStatus === TicketStatus.UnableToCharge;
        }
        static isTicketClosed(ticketStatus: TicketStatus): boolean {
            return ticketStatus === TicketStatus.Closed;
        }
        static isTicketClosing(ticketStatus: TicketStatus): boolean {
            return ticketStatus >= TicketStatus.PendingClose && ticketStatus < TicketStatus.Closed;
        }
        static isTicketCannotClose(ticketStatus: TicketStatus): boolean {
            return ticketStatus === TicketStatus.CannotClose;
        }
        static isTicketCancelled(ticketStatus: TicketStatus): boolean {
            return ticketStatus === TicketStatus.Cancelled;
        }
        static ticketStatusToTitle(ndx: number): string {
            var toString = TicketStatus[ndx];
            return (typeof (toString) == "undefined") ? null : GenericUtils.camelToTitle(toString);
        }
        static travelDirectionToTitle(ndx: number): string {
            var toString = TravelDirection[ndx];
            return (typeof (toString) == "undefined") ? null : GenericUtils.camelToTitle(toString);
        }
        static greeterSagaStatusToTitle(ndx: number): string {
            var toString = GreeterSagaStatus[ndx];
            return (typeof (toString) == "undefined") ? null : GenericUtils.camelToTitle(toString);
        }
        static runnerSagaStatusToTitle(ndx: number): string {
            var toString = RunnerSagaStatus[ndx];
            if (!toString || typeof(toString) == "undefined") return null;
            if (toString.length > 16) {
                var longString = GenericUtils.camelToTitle(toString);
                var firstWord = longString.substr(0, longString.indexOf(" "));
                return firstWord + "..";
            }
            return GenericUtils.camelToTitle(toString);
        }
        static constructAssignRunnerCommand(ticketID: string, runnerSagaEmployeeID: string, runnerSagaEmployeeFriendlyID: string, createdBy: string): AssignRunnerCommandDTO {
            var command = new AssignRunnerCommandDTO();
            command.ID = ticketID;
            command.CreatedBy = createdBy;
            command.EmployeeID = runnerSagaEmployeeID;
            command.EmployeeFriendlyID = runnerSagaEmployeeFriendlyID;
            return command;
        }
        static initializeSignalRConnection(): SignalR.Hub.Connection {
            var hubUrl = AppConfig.APIHOST + "signalr/hubs";
            var connection = $.hubConnection(hubUrl, { useDefaultPath: false });
            connection.logging = true;

            return connection;
        }
        static configureTicketSignalRHub(hubTicket: SignalR.Hub.Proxy, scopeContext: any = null): SignalR.Hub.Proxy {
            // Filter notifications from Tickets outside of date/time filter. Requires that variale names
            // from/to date filters are filterFromDateTime and filterToDateTime, respectively.
            const dateTimeIsOutsideFilter = (compareDateTime: string, fromDateTime: string, toDateTime: string): boolean => {
                if (!compareDateTime || ! fromDateTime || !toDateTime) return false;
                var compareNum = Date.parse(compareDateTime);
                var fromNum = Date.parse(fromDateTime);
                var toNum = Date.parse(toDateTime);
                if (isNaN(compareNum) || isNaN(fromNum) || isNaN(toNum)) return false;
                if (compareNum < fromNum || compareNum > toNum) return true;
            }
            hubTicket.on("create",
                (data) => {
                    if (!!scopeContext && dateTimeIsOutsideFilter(data.DateTimeCustomerMeetsValet, scopeContext.filterFromDateTime, scopeContext.filterToDateTime)) {
                        console.log(`${data.DateTimeCustomerMeetsValet} is out of range of ${scopeContext.filterFromDateTime} - ${scopeContext.filterToDateTime}`);
                        return;
                    }
                    var notification1 = $("#notification").kendoNotification().data("kendoNotification");
                    if (!!notification1) notification1.success("Added #" + data.TicketNumber + " [" + data.CustomerName + "]");
                });
            hubTicket.on("update",
                (data) => {
                    if (!!scopeContext && dateTimeIsOutsideFilter(data.DateTimeCustomerMeetsValet, scopeContext.filterFromDateTime, scopeContext.filterToDateTime)) {
                        console.log(`${data.DateTimeCustomerMeetsValet} is out of range of ${scopeContext.filterFromDateTime} - ${scopeContext.filterToDateTime}`);
                        return;
                    }
                    var notification1 = $("#notification").kendoNotification().data("kendoNotification");
                    if (!!notification1) notification1.success("Updated #" + data.TicketNumber + " [" + data.CustomerName + "]");
                });
            hubTicket.on("destroy",
                (data) => {
                    if (!!scopeContext && dateTimeIsOutsideFilter(data.DateTimeCustomerMeetsValet, scopeContext.filterFromDateTime, scopeContext.filterToDateTime)) {
                        console.log(`${data.DateTimeCustomerMeetsValet} is out of range of ${scopeContext.filterFromDateTime} - ${scopeContext.filterToDateTime}`);
                        return;
                    }
                    var notification1 = $("#notification").kendoNotification().data("kendoNotification");
                    if (!!notification1) notification1.success("Removed #" + data.TicketNumber + " [" + data.CustomerName + "]");
                });
            return hubTicket;
        }
        static configureTicketSignalRHubNotDateFiltered(hubTicket: SignalR.Hub.Proxy, scopeContext: any = null): SignalR.Hub.Proxy {
            hubTicket.on("create",
                (data) => {
                    var notification1 = $("#notification").kendoNotification().data("kendoNotification");
                    if (!!notification1) notification1.success("Added #" + data.TicketNumber + " [" + data.CustomerName + "]");
                });
            hubTicket.on("update",
                (data) => {
                    var notification1 = $("#notification").kendoNotification().data("kendoNotification");
                    if (!!notification1) notification1.success("Updated #" + data.TicketNumber + " [" + data.CustomerName + "]");
                });
            hubTicket.on("destroy",
                (data) => {
                    var notification1 = $("#notification").kendoNotification().data("kendoNotification");
                    if (!!notification1) notification1.success("Removed #" + data.TicketNumber + " [" + data.CustomerName + "]");
                });
            return hubTicket;
        }

        static setTimeFieldsForConstructedFlightStatus(flightStatus: FlightStatusDTO, flightSchedule: ScheduleDTO, currentUser: string) {
            flightStatus.StatusCode = FlightStatusCode.Unknown;
            flightStatus.FlightTimeSource = currentUser;
            if (!!flightSchedule) flightStatus.FlightTime = flightSchedule.ScheduleDateTime;
        }
        static setAllFieldsForConstructedFlightStatus(flightStatus: FlightStatusDTO, flightSchedule: ScheduleDTO, currentUser: string) {
            this.setTimeFieldsForConstructedFlightStatus(flightStatus, flightSchedule, currentUser);
            flightStatus.BaggageClaim = "";
            flightStatus.TerminalGate = "";
        }
    }

    export class ValetUtils {
        static valetParseFunction(response) {
            $.each(response, (idx, elem) => {
                elem.ExtendedFriendlyID = elem.FriendlyID + (elem.DeviceCode === null ? "" : " " + elem.DeviceCode);
            });
            return response;
        };
    }

    export class DateTimeUtils {
        static millisecondsToMinutes(milliseconds: number): number {
            if (!milliseconds || typeof (milliseconds) !== "number") {
                return null;
            }
            return Math.floor(milliseconds / (60 * 1000));
        }
        static minutesToHourMinuteSpanString(minutes: number): string {
            if (!minutes || typeof (minutes) !== "number") {
                return null;
            }
            var hoursPart = Math.floor(minutes / 60);
            var minutesPart = minutes - 60 * hoursPart;
            return hoursPart + "h " + (minutesPart < 10 ? "0" : "") + minutesPart + "m";
        }
        static isoDateStringToDateOnly = (isoDateTimeString: string): Date => {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
            // "It is not recommended to use Date.parse ..."
            var len = isoDateTimeString.length;
            if (len < 10) {
                throw "Invalid length for date string: " + isoDateTimeString;
            }
            var year = Number(isoDateTimeString.substring(0, 4));
            var month = Number(isoDateTimeString.substring(5, 7));
            var day = Number(isoDateTimeString.substring(8, 10));
            return new Date(year, month - 1, day);
        }
        static addHours = (d: Date, h: number): Date => {
            var copiedDate = new Date(d.valueOf());
            copiedDate.setTime(copiedDate.getTime() + (h * 60 * 60 * 1000));
            return copiedDate;
        }
    }

    export class FlightUtils {
        static flightStatusCodeToString = (ndx: number): string => {
            var toString = FlightStatusCode[ndx];
            return (typeof (toString) == "undefined") ? null : toString;
        };
        static flightDirectionToString = (ndx: number): string => {
            var toString = FlightDirection[ndx];
            return (typeof (toString) == "undefined") ? null : toString;
        };
        static flightDirectionToLower = (ndx: number): string => {
            var toString = FlightDirection[ndx];
            return (typeof (toString) == "undefined") ? null : toString.toLowerCase();
        };
        static flightStatusCodeToTitle = (ndx: number): string => {
            var toString = FlightStatusCode[ndx];
            return (typeof (toString) == "undefined") ? null : GenericUtils.camelToTitle(toString);
        };
        static flightTimeSourceToFriendly = (timeSource: string, ndx: number): string => {
            if (typeof (timeSource) == "undefined") {
                return null;
            }
            return GenericUtils.camelToTitle(timeSource) + " " + FlightUtils.flightDirectionToString(ndx);
        };
    }

    export class CommunicationUtils {
        static referenceContextTicket = "Ticket";
        static referenceContextServiceTask = "ServiceTask";
        static referenceContextIssue = "Issue";
        static referenceContextCustomer = "Customer";
        static referenceContextAll = "All";

        static MessageStatusToTitle(ndx: number): string {
            var toString = MessageStatus[ndx];
            return (typeof (toString) == "undefined") ? null : GenericUtils.camelToTitle(toString);
        }
        static buildAdHocCommunicationUrl(context: string): string {
            var adHocCommunicationUrl = AppStaff.AppStaffConfig.appStaffUrlPrefix + AppStaff.ConfigureRoutesForCommunicationContext.sendMessageUrlSuffix
                + "/" + context;

            return adHocCommunicationUrl;
        }
        static buildReferenceDTO(identifier: string, name: string, customerName: string, identifierFriendlyName: string = null): MessageContextDTO {
            var reference = new MessageContextDTO();
            reference.Identifier = identifier;
            reference.Name = name;
            reference.FriendlyIdentifier = customerName + " " + name + 
                (GenericUtils.isUndefinedNullEmptyOrWhiteSpace(identifierFriendlyName) ? "" : " " + identifierFriendlyName);

            return reference;
        }
    }

    export class SearchUtils {
        static omnisearchResultTypeToTitle(ndx: number): string {
            var toString = OmnisearchResultType[ndx];
            var title = (typeof (toString) == "undefined") ? null : GenericUtils.camelToTitle(toString);
            return title.replace("Current Record", "").trim();
        }
    }

    export class EventUtils {
        static parseEventsHtml(dataEvents: any): Array<any> {
            // We need to parse the HTML content is retuning from backend
            // so let's iterate through the data and transform it a little to display better on UI
            var parsedEvents = [];

            dataEvents.forEach(item => {
                let eventhtml = $('<div/>').html(item); // wrap event content

                //    Let's wrap fieldvalue's content into <pre> tags to display complex info
                //    REMIND: pre tags are util to display free json info easier
                eventhtml.find('span.fieldvalue').wrapInner("<pre class='content'></pre>");

                //    We don't know when come JSON or not, so we check and parse it to display
                $.each(eventhtml.find('span.fieldvalue'), (index, value) => {
                    const jsonObj = GenericUtils.parseJSON(value.textContent);
                    if (typeof (jsonObj) !== "undefined") {
                        // invoke recursive function for complex json
                        const prettyContent = this.buildPrettyJsonInfo(jsonObj, index, false);
                        $(eventhtml.find('pre.content')[index]).html(prettyContent);
                    }
                });

                const id = $(item).find('span.id-fieldvalue').text();
                const ev = { id: id, content: eventhtml.html(), display: true };
                parsedEvents.push(ev);
            });

            return parsedEvents;
        }
        static buildPrettyJsonInfo(jsonObj: any, index: number, isChild: boolean): string {
            var prettyContent = '';
            $.each(jsonObj, (k, v) => {
                if (!!k && typeof k == "string") {
                    const prop = k.replace(/([^A-Z])([A-Z])/g, '$1 $2'); // split camelCaseTextKey

                    if (v && typeof (v) === "object") {
                        prettyContent += `<b> ${prop} </b> </br>`;
                        prettyContent += this.buildPrettyJsonInfo(v, index, true); // recursive function
                    } else {
                        // print formated json properties inside <pre> 
                        let row = !isChild ? `<b> ${prop} : </b> ${v} </br>` : `   -<b> ${prop} : </b> ${v} </br>`;
                        prettyContent += row;
                    }
                }
            });

            return prettyContent;
        }

    }

    export class RewardUtils {
        
        static isFiniteNumber(numToCheck: any): boolean {
            return !AppCommon.GenericUtils.isUndefinedOrNull(numToCheck);
        }
        static isNonNegativeFiniteNumber(numToCheck: any): boolean {
            return RewardUtils.isFiniteNumber(numToCheck) && numToCheck >= 0;
        }
        static isPositiveFiniteNumber(numToCheck: any): boolean {
            return RewardUtils.isFiniteNumber(numToCheck) && numToCheck > 0;
        }
        static maxCanReserve(availableReward: any, remainingPoints: number) {
            if (availableReward.AppliesTo === RewardAppliesTo.AdditionalService) {
                return 1;
            }
            if (availableReward.Points === 0) {
                return availableReward.QuantityAvailable;
            }
            var maxCanAfford = Math.floor(remainingPoints / availableReward.Points);
            if (maxCanAfford < 0) {
                return 0;
            }
            if (availableReward.AppliesTo === RewardAppliesTo.Parking) {
                return maxCanAfford;
            }
            return maxCanAfford > availableReward.QuantityAvailable ? availableReward.QuantityAvailable : maxCanAfford;
        }
    }
}