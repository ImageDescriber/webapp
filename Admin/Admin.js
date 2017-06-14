app.controller("AdminCtrl", function ($scope, $http) {
    /* -- Scope and variables definition -- */
    $scope.loading = true;
    $scope.loadingData = false;

    $scope.loadData = function() {
        $scope.loadingData = true;
        $http.get('https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=%23Paintings%0ASELECT %3Fitem %3FitemLabel %3Fimage WHERE {%0A %3Fitem wdt%3AP31 wd%3AQ3305213.%0A %3Fitem wdt%3AP18 %3Fimage.%0A SERVICE wikibase%3Alabel { bd%3AserviceParam wikibase%3Alanguage "[AUTO_LANGUAGE]%2Cfr%2Cen". }%0A}').then(function (response) {
            console.log(response.data);

            for(var itemId in response.data.results.bindings) {
                var item  = response.data.results.bindings[itemId];
                console.log(item);

                var qwd = item.item.value.replace('http://www.wikidata.org/entity/Q', '');
                console.log(qwd);
                $http.get('http://localhost:8888/ImageDescriber/api/web/app_dev.php/entities').then(function (responseAPI) {
                    //var itemAPI = responseAPI.data.results.bindings[0];
                    console.log(responseAPI.data);
                }, function(responseAPI) {
                    $scope.data = responseAPI.data || 'Request failed';
                    $scope.status = responseAPI.status;
                    console.log($scope.data);
                });
            }

            //$scope.items = response.data;
            $scope.loadingData = false;
        });
    };
});