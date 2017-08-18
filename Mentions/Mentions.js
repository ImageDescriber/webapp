app.controller("MentionsCtrl", function ($scope, $http, $cookieStore) {
    /* Language modal management */
    if($cookieStore.get('histoiredelart_wikidata_id_language') !== undefined) {
        $scope.language = $cookieStore.get('histoiredelart_wikidata_id_language');
    } else {
        $scope.language = 'en';
    }

    console.log($scope.language);
});