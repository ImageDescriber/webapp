app.controller("HomeCtrl", function ($scope, $http, $sce, $timeout, $parse, $cookies, $cookieStore, $route) {
    /* -- Scope and variables definition -- */
    var server = "http://localhost:8888/ImageDescription/api/web/app_dev.php"; //http://imagedescription.histoiredelart.fr/api/web

    /* Variables */
    $scope.page = {
        loading: true,
        loadThanks: false,
        translation: YAML.load('web/translation.yml')['en']
    };
    $scope.depict = {
        newDepictValue: "",
        depicts: [],
        wdtDepicts: [],
        wdtDepictsConstruction: [],
        wdtDepictsLength: 0
    };
    $scope.search = {
        language: "en",
        languageDefinition: false,
        searchStr: "",
        id: "searchInput",
        pause: 100,
        selectedObject: "selectedObject",
        url: "https://www.wikidata.org/w/api.php?action=wbsearchentities&language=en&format=json&search=",
        inputclass: "form-control",
        minLength: 1
    };
    $scope.item = {
        qwd: null,
        image: null,
        label: null,
        description: null,
        creator: null,
        date_creation: null,
        genre: null,
        collection: null,
        url: null
    };
    /* Variables */

    /* Language modal management */
    if($cookieStore.get('id_histoiredelart_language') !== undefined) {
        $scope.search.languageDefinition = true;
        $scope.search.language = $cookieStore.get('id_histoiredelart_language');
        $scope.search.url = "https://www.wikidata.org/w/api.php?action=wbsearchentities&language="+$scope.search.language+"&format=json&search=";
        $scope.page.translation = YAML.load('web/translation.yml')[$scope.search.language];
    }
    $scope.setLanguage = function (language) {
        $scope.search.languageDefinition = true;
        $scope.search.language = language;
        $scope.page.translation = YAML.load('web/translation.yml')[$scope.search.language];
        $scope.search.url = "https://www.wikidata.org/w/api.php?action=wbsearchentities&language="+$scope.search.language+"&format=json&search=";
        $cookieStore.put('id_histoiredelart_language', $scope.search.language);
    };
    /* Language modal management */

    /* HomeTop management */
    if($cookieStore.get('id_histoiredelart_topmanagement') !== undefined) {
        $scope.topMangement = $cookieStore.get('id_histoiredelart_topmanagement');
    } else {
        $scope.topMangement = "up";
    }
    $scope.topManagement = function() {
        if($scope.topMangement === "up") {
            $scope.topMangement = "down";
            $cookieStore.put('id_histoiredelart_topmanagement', 'down');
        } else if($scope.topMangement === "down") {
            $scope.topMangement = 'up';
            $cookieStore.put('id_histoiredelart_topmanagement', 'up');
        }
    };
    /* HomeTop management */

    /* Get item */
    $http.get(server+'/entities?random=true').then(function (response) {
        $scope.item = response.data[0];

        var url = "http://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q"+$scope.item.qwd+"&format=json";
        var trustedUrl = $sce.trustAsResourceUrl(url);

        $http.jsonp(trustedUrl, {jsonpCallbackParam: 'callback'})
            .then(function(response){
                $scope.wdtItem = response.data['entities']["Q"+$scope.item.qwd];
                generateInfoItem();
            });

        $scope.page.loading = false;
    });
    function generateInfoItem() {
        console.log($scope.wdtItem);
        $scope.item.label = getProperty($scope.wdtItem.labels);
        $scope.item.description = getProperty($scope.wdtItem.descriptions);
        if($scope.wdtItem.claims["P136"] !== undefined) {
            /* P136 == Genre */
            $scope.item.genre = getProperty($scope.wdtItem.claims["P136"]);
        }
        if($scope.wdtItem.claims["P571"] !== undefined) {
            /* P571 == Date of creation */
            $scope.item.date_creation = getProperty($scope.wdtItem.claims["P571"]);
        }
        if($scope.wdtItem.claims["P170"] !== undefined) {
            /* P170 == Creator */
            $scope.item.creator = getProperty($scope.wdtItem.claims["P170"]);
        }
        if($scope.wdtItem.claims["P195"] !== undefined) {
            /* P195 == Collection */
            $scope.item.collection = getProperty($scope.wdtItem.claims["P195"]);
        }
        if($scope.wdtItem.claims["P973"] !== undefined) {
            /* P973 == Described at */
            $scope.item.url = getProperty($scope.wdtItem.claims["P973"]);
        }

        if($scope.wdtItem.claims["P180"] !== undefined) {
            /* P180 == Depicts */
            $scope.depict.wdtDepictsLength = $scope.wdtItem.claims["P180"].length;
            loadClaims($scope.wdtItem.claims["P180"]);
        }
    }
    /* Get item */

    /* Actions */
    $scope.newDepict = function() {
        $scope.depict.depicts.push($scope.search.selectedObject);
        $scope.search.searchStr = "";
    };

    $scope.removeDepict = function(dDepict) {
        for(depict in $scope.depict.depicts) {
            if(dDepict["qwd"] === $scope.depict.depicts[depict]["qwd"]) {
                $scope.depict.depicts.splice(depict, 1);
            }
        }
    };

    $scope.persist = function() {
        $scope.loadThanks = true;
        if($scope.depict.depicts.length > 0) {
            var qwds = [];
            for(depict in $scope.depict.depicts) {
                qwds.push($scope.depict.depicts[depict]["qwd"]);
            }
            $http.patch(server+'/entities/'+$scope.item.id, {"listDepicts": qwds}).then(function (response) {
                $route.reload();
            });
        }
    };

    $scope.nothingToAdd = function() {
        $scope.loadThanks = true;
        $route.reload();
    };

    $scope.pass = function() {
        $scope.loadThanks = true;
        $route.reload();
    };
    /* Actions */

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
    /* AnguComplete Fork */

    /* Function: depicts */
    function loadClaims(claimP180) {
        for(var iClaim in claimP180) {
            var entry = claimP180[iClaim];

            if(entry.mainsnak.datavalue.value.id !== undefined) {
                var url = "http://www.wikidata.org/w/api.php?action=wbgetentities&ids="+entry.mainsnak.datavalue.value.id+"&format=json";
                var trustedUrl = $sce.trustAsResourceUrl(url);

                $http.jsonp(trustedUrl, {jsonpCallbackParam: 'callback'})
                    .then(function (response) {
                        //console.log(response.data['entities']);
                        $scope.depict.wdtDepictsConstruction.push(response.data['entities']);
                        encodeClaims();
                    });
            }
        }
    }
    function encodeClaims() {
        //console.log($scope.depict.wdtDepictsConstruction);
        if ($scope.depict.wdtDepictsConstruction.length === $scope.depict.wdtDepictsLength) {
            for(var wdtDepictId in $scope.depict.wdtDepictsConstruction) {
                var wdtDepict = $scope.depict.wdtDepictsConstruction[wdtDepictId];
                for(var itemQwd in wdtDepict) {
                    var item = wdtDepict[itemQwd];
                    $scope.depict.wdtDepicts.push({qwd: itemQwd, label: getClaimLabel(item)});
                }
            }
        }
    }
    function getClaimLabel(item) {
        var labels = item.labels;
        if(labels[$scope.search.language] !== undefined) {
            return item.labels[$scope.search.language].value;
        } else if(labels.en !== undefined) {
            return item.labels.en.value;
        } else if(labels.fr !== undefined) {
            return item.labels.fr.value;
        } else if(labels.it !== undefined) {
            return item.labels.it.value;
        } else if(labels.de !== undefined) {
            return item.labels.de.value;
        } else if(labels.nl !== undefined) {
            return item.labels.nl.value;
        } else if(labels.es !== undefined) {
            return item.labels.es.value;
        }
    }
    /* Function: depicts */


    /* Object Browser for Wikidata */
    function getProperty(property) {
        if(property[$scope.search.language] !== undefined) {
            return property[$scope.search.language].value;
        } else if(property.en !== undefined) {
            return property.en.value;
        } else if(property.fr !== undefined) {
            return property.fr.value;
        } else if(property.it !== undefined) {
            return property.it.value;
        } else if(property.de !== undefined) {
            return property.de.value;
        } else if(property.nl !== undefined) {
            return property.nl.value;
        } else if(property.es !== undefined) {
            return property.es.value;
        } else {
            return "";
        }
    }
});