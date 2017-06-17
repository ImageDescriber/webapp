var app = angular.module("IDApp", ["ngRoute", "ngCookies"]);
app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "Home/Home.html",
            controller : "HomeCtrl"
        })
        .when("/mentions-legales", {
            templateUrl : "Mentions/Mentions.html",
            controller : "MentionsCtrl"
        })
        .otherwise({
            templateUrl : "Home/Home.html",
            controller : "HomeCtrl"
        });
}]);