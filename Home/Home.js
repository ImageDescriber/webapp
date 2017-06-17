app.controller("HomeCtrl", function ($scope, $http, $sce, $timeout, $parse, $cookies, $cookieStore, $route) {
    /* -- Scope and variables definition -- */
    $scope.loading = true;
    $scope.newDepictValue = "";
    $scope.depicts = [];
    $scope.previousDepicts = [];
    $scope.loadThanks = false;

    $scope.search = {};
    /* Language modal management */
    if($cookieStore.get('id_histoiredelart_language') === undefined) {
        $scope.search.language = "en";
        $('#modalLanguage').modal('show');
    } else {
        $scope.search.language = $cookieStore.get('id_histoiredelart_language');
    }
    $scope.active = function (id) {
        $('#' + id).addClass('active');
        $scope.search.url = "https://www.wikidata.org/w/api.php?action=wbsearchentities&language="+$scope.search.language+"&format=json&search=";
        $cookieStore.put('id_histoiredelart_language', $scope.search.language);
    };
    $scope.closeModalLanguage = function() {
        $('#modalLanguage').modal('hide');
    };
    /* Language modal management */

    $scope.search.searchStr = "";
    $scope.search.id = "searchInput";
    $scope.search.placeholder = "\"Jésus\", \"femme\", \"chapeau\", \"forêt\"...";
    $scope.search.pause = 100;
    $scope.search.selectedObject = "selectedObject";
    $scope.search.url = "https://www.wikidata.org/w/api.php?action=wbsearchentities&language="+$scope.search.language+"&format=json&search=";
    $scope.search.inputclass = "form-control";
    $scope.search.minLength = 1;

    /* HomeTop management */
    if($cookieStore.get('id_histoiredelart_topmanagement') !== undefined) {
        $scope.topMangement = $cookieStore.get('id_histoiredelart_topmanagement');
    } else {
        $scope.topMangement = "up";
    }
    $scope.topManagement = function() {
        if($scope.topMangement === "up") {
            $('#topHome p').hide();

            $scope.topMangement = "down";
            $cookieStore.put('id_histoiredelart_topmanagement', 'down');
        } else if($scope.topMangement === "down") {
            $('#topHome p').hide();

            $scope.topMangement = 'up';
            $cookieStore.put('id_histoiredelart_topmanagement', 'up');
        }
    };
    /* HomeTop management */

    /* Get item */
    $http.get('http://localhost:8888/ImageDescriber/api/web/app_dev.php/entities?random=true').then(function (response) {
        console.log(response.data);
        $scope.item = response.data[0];

        var url = "http://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q"+$scope.item.qwd+"&format=json";
        var trustedUrl = $sce.trustAsResourceUrl(url);

        $http.jsonp(trustedUrl, {jsonpCallbackParam: 'callback'})
            .then(function(response){
                console.log(response.data);
                $scope.wdtItem = response.data['entities']["Q"+$scope.item.qwd];
            });

        $scope.loading = false;
    });
    /* Get item */

    $scope.newDepict = function() {
        console.log($scope.search.selectedObject);
        $scope.depicts.push($scope.search.selectedObject);
        console.log($scope.depicts);

        $scope.search.searchStr = "";
    };

    $scope.removeDepict = function(dDepict) {
        console.log(dDepict);
        console.log($scope.depicts);
        for(depict in $scope.depicts) {
            if(dDepict["qwd"] === $scope.depicts[depict]["qwd"]) {
                console.log('ok');
                $scope.depicts.splice(depict, 1);
            }
        }
    };

    $scope.persist = function() {
        $scope.loadThanks = true;
        if($scope.depicts.length > 0) {
            var qwds = [];
            for(depict in $scope.depicts) {
                qwds.push($scope.depicts[depict]["qwd"]);
            }
            $http.patch('http://localhost:8888/ImageDescriber/api/web/app_dev.php/entities/'+$scope.item.id, {"listDepicts": qwds}).then(function (response) {
                console.log(response.data);
                $route.reload();
            });
        }
    };


    /* AnguComplete Fork */
    $scope.processResults = function(responseData, str) {
        if (responseData && responseData.length > 0) {
            $scope.search.results = [];
            for (var i = 0; i < responseData.length; i++) {
                $scope.search.results[$scope.search.results.length] = {
                    label: responseData[i]["label"],
                    description: responseData[i]["description"],
                    qwd: parseInt(responseData[i]["title"].replace('Q', '')),
                    originalObject: responseData[i]
                };
            }
        } else {
            $scope.search.results = [];
        }
    };

    $scope.searchTimerComplete = function() {
        if ($scope.search.searchStr.length >= $scope.search.minLength) {
            $http.jsonp($sce.trustAsResourceUrl($scope.search.url + $scope.search.searchStr), {jsonpCallbackParam: 'callback'})
                .then(function(responseData, status, headers, config){
                    console.log(responseData.data);
                    $scope.search.searching = false;
                    $scope.processResults(responseData.data['search'], $scope.search.searchStr);
                });
        }
    };

    $scope.hideResults = function() {
        $scope.search.hideTimer = $timeout(function() {
            $scope.search.showDropdown = false;
        }, $scope.search.pause);
    };

    $scope.resetHideResults = function() {
        if($scope.search.hideTimer) {
            $timeout.cancel($scope.search.hideTimer);
        }
    };

    $scope.hoverRow = function(index) {
        $scope.search.currentIndex = index;
    };

    $scope.selectResult = function(result) {
        if ($scope.search.matchClass) {
            result.search.label = result.label.toString().replace(/(<([^>]+)>)/ig, '');
        }
        $scope.search.searchStr = $scope.search.lastSearchTerm = result.label;
        $scope.search.selectedObject = result;
        $scope.search.showDropdown = false;
        $scope.search.results = [];
        //$scope.$apply();
    };

    $scope.$watch('search.searchStr', function() {
        if ($scope.search.searchStr.length >= $scope.search.minLength) {
            $scope.search.showDropdown = true;
            $scope.search.currentIndex = -1;
            $scope.search.results = [];

            if ($scope.search.searchTimer) {
                $timeout.cancel($scope.search.searchTimer);
            }

            $scope.search.searching = true;

            $scope.search.searchTimer = $timeout(function () {
                $scope.searchTimerComplete();
            }, $scope.search.pause);
        }
    });

});