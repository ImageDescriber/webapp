'use strict';

angular.module('IDApp', [
    'ui.router',
    'ngRoute',
    'ngCookies',
    'ngSanitize',
    'id.home',
    'id.mentions',
    'id.admin',
]).
config(['$stateProvider','$httpProvider', '$urlRouterProvider', '$qProvider', '$injector', function($stateProvider, $httpProvider, $urlRouterProvider, $qProvider, $injector) {
    $urlRouterProvider.otherwise('/');
    $qProvider.errorOnUnhandledRejections(false);

}])
.run(['$rootScope', '$http', '$injector', '$location', '$state', '$cookies', function($rootScope, $http, $injector, $location, $state, $cookies) {
    let parameters = YAML.load('parameters.yml');
    $rootScope.api = parameters.api;
    $rootScope.cookie_version = parameters.cookie_version;
}])
.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
})
.directive('showDuringResolve', function($rootScope) {
    return {
        link: function(scope, element) {

            element.addClass('ng-hide');

            var unregister = $rootScope.$on('$routeChangeStart', function() {
                element.removeClass('ng-hide');
            });

            scope.$on('$destroy', unregister);
        }
    };
})
.directive('resolveLoader', function($rootScope, $timeout) {

    return {
        restrict: 'E',
        replace: true,
        template: '<div class="text-center ng-hide"><i class="fa fa-4x fa-spin fa-circle-o-notch"></i></div>',
        link: function(scope, element) {

            $rootScope.$on('$routeChangeStart', function(event, currentRoute, previousRoute) {
                if (previousRoute) return;

                $timeout(function() {
                    element.removeClass('ng-hide');
                });
            });

            $rootScope.$on('$routeChangeSuccess', function() {
                element.addClass('ng-hide');
            });
        }
    };
});