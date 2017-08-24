'use strict';

angular.module('id.admin', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('admin', {
            views: {
                "navbar" : {
                    templateUrl: 'Mentions/Navbar.html',
                    controller: 'MentionsCtrl'
                },
                "page" : {
                    templateUrl: 'Admin/Admin.html',
                    controller: 'AdminCtrl'
                }
            },
            url: '/statistics',
            resolve: {
                entities: function(EntityService) {
                    return EntityService.getEntities();
                },
                entitiesD: function(EntityService) {
                    return EntityService.getEntitiesWithDepicts();
                },
                logs: function(LogService) {
                    return LogService.getLogs();
                }
            }
        })
    }])

    .controller('AdminCtrl', ['$rootScope','$scope', '$http', '$cookieStore', 'entities', 'entitiesD', 'logs', function($rootScope, $scope, $http, $cookieStore, entities, entitiesD, logs) {
        /* Language modal management */
        if($cookieStore.get($rootScope.cookie_version+'_histoiredelart_wikidata_id_language') !== undefined) {
            $scope.language = $cookieStore.get($rootScope.cookie_version+'_histoiredelart_wikidata_id_language');
        } else {
            $scope.language = 'en';
        }

        $scope.logs = logs;
        $scope.entities = entitiesD;
        $scope.entitiesND = entities;
    }])
;