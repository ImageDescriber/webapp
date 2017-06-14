var app = angular.module("IDApp", ["ngRoute"]);
app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "Home/Home.html",
            controller : "HomeCtrl"
        })
        .when("/admin", {
            templateUrl : "Admin/Admin.html",
            controller : "AdminCtrl"
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