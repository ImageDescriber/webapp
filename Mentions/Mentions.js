'use strict';

angular.module('id.mentions', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('mentions', {
            views: {
                "navbar" : {
                    templateUrl: 'Mentions/Navbar.html',
                    controller: 'MentionsCtrl'
                },
                "page" : {
                    templateUrl: 'Mentions/Mentions.html',
                    controller: 'MentionsCtrl'
                }
            },
            url: '/mentions-legales'
        })
    }])

    .controller('MentionsCtrl', ['$rootScope','$scope', '$http', '$cookieStore', function($rootScope, $scope, $http, $cookieStore) {
        /* Language modal management */
        if($cookieStore.get($rootScope.cookie_version+'_histoiredelart_wikidata_id_language') !== undefined) {
            $scope.language = $cookieStore.get($rootScope.cookie_version+'_histoiredelart_wikidata_id_language');
        } else {
            $scope.language = 'en';
        }
    }])
;