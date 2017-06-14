app.controller("HomeCtrl", function ($scope, $http) {
    /* -- Scope and variables definition -- */
    $scope.loading = true;

    /*$http.get("http://localhost:8888/ImageDescriber/api/web/app_dev.php/").then(function (response) {
        console.log(response.data);
        $scope.items = response.data;
    });*/

    $http.get('https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=%23Paintings%0ASELECT %3Fitem %3FitemLabel WHERE {%0A %3Fitem wdt%3AP31 wd%3AQ3305213.%0A SERVICE wikibase%3Alabel { bd%3AserviceParam wikibase%3Alanguage "[AUTO_LANGUAGE]%2Cfr%2Cen". }%0A}').then(function (response) {
        console.log(response.data);
        //$scope.items = response.data;
    });
});