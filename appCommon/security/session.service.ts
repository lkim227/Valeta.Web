module AppCommon {
    export class SessionService {
        userInfo: UserInfo;

        static $inject = ["$window", "Restangular"];

        constructor(private $window: Window, private restng: restangular.IService) {
        }

        createUserInfo(sessionObject) {
            if ((!sessionObject && !angular.isObject(sessionObject))) {
                this.userInfo = null;
                return;
            }
            this.userInfo = new UserInfo();
            this.userInfo.expires = sessionObject.expires;
            this.userInfo.access_token = sessionObject.access_token;
            this.userInfo.token_type = sessionObject.token_type;
            this.userInfo.userID = sessionObject.userID;
            this.userInfo.customerAccountID = sessionObject.customerAccountID;
            if (sessionObject.employeeID === GuidService.EmptyGuid()) {
                sessionObject.employeeID = null;
            }
            this.userInfo.employeeID = sessionObject.employeeID;
            this.userInfo.employeeFriendlyID = sessionObject.employeeFriendlyID;
            this.userInfo.customerFriendlyID = sessionObject.customerFriendlyID;
            this.userInfo.userName = sessionObject.userName;
            this.userInfo.userRoles = JSON.parse(sessionObject.userRoles);
            this.userInfo.UserRights = JSON.parse(sessionObject.userRights);
        };

        create(sessionObject, rememberMe) {
            if (!sessionObject) {
                const info = this.$window.localStorage.getItem("userSession");
                let parsed;
                if (!!info) {
                    parsed = JSON.parse(info);
                } else {
                    parsed = JSON.parse(this.$window.sessionStorage.getItem("userSession"));
                }
                if (!!parsed && angular.isObject(parsed)) {
                    this.createUserInfo(parsed);
                } else {
                    RestClientBase.authorizationHeader = ""; //remove tokens from requests
                }

            } else {
                this.createUserInfo(sessionObject);

                if (!!this.$window.sessionStorage) {
                    this.$window.sessionStorage.setItem("userSession", JSON.stringify(sessionObject));
                }

                if (rememberMe && !!this.$window.localStorage) {
                    this.$window.localStorage.setItem("userSession", JSON.stringify(sessionObject));
                }
            }

            if (!!this.userInfo && !!this.userInfo.access_token) {
                RestClientBase.authorizationHeader = `Bearer ${this.userInfo.access_token}`;
            }
        };

        destroy() {
            this.userInfo = null;

            if (!!this.$window.localStorage) {
                this.$window.localStorage.removeItem("userSession");
            }

            if (!!this.$window.sessionStorage) {
                this.$window.sessionStorage.removeItem("userSession");
            }

            RestClientBase.authorizationHeader = "";

//            $rootScope.$broadcast('event:userSession-changed', {});
//            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        };
    }

    angular.module("app.common")
        .service("SessionService",
        [
            "$window", "Restangular",
            (w, rest) => new SessionService(w, rest)
        ]);
}