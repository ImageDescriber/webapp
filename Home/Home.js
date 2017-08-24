'use strict';

angular.module('id.home', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('home', {
            views: {
                "navbar" : {
                    templateUrl: 'Home/Navbar.html',
                    controller: 'HomeCtrl'
                },
                "page" : {
                    templateUrl: 'Home/Home.html',
                    controller: 'HomeCtrl'
                }
            },
            url: '/?keywords?cursor',
            resolve: {
                entity: function(EntityService, $transition$) {
                    if($transition$.params().keywords !== undefined) {
                        return EntityService.getSearchEntity($transition$.params().keywords, ($transition$.params().cursor));
                    } else {
                        return EntityService.getRandomEntity();
                    }
                },
                nbEntities: function(EntityService, $transition$) {
                    if($transition$.params().keywords !== undefined) {
                        return EntityService.getSearchEntityNumber($transition$.params().keywords);
                    } else {
                        return EntityService.getEntitiesNumber();
                    }
                },
                nbEntitiesDescribed: function(EntityService) {
                    return EntityService.getEntitiesWithDepictsNumber();
                }
            }
        })
    }])

    .service('EntityService', function($http, $rootScope) {
        return {
            getEntities: function() {
                return $http.get($rootScope.api+"/entities").then(function(response) {
                    //console.log(response);
                    return response.data;
                });
            },
            getEntitiesNumber: function() {
                return $http.get($rootScope.api+"/entities?count=true").then(function(response) {
                    return response.data;
                });
            },
            getEntitiesWithDepicts: function() {
                return $http.get($rootScope.api+"/entities?depicts=true").then(function(response) {
                    return response.data;
                });
            },
            getEntitiesWithDepictsNumber: function() {
                return $http.get($rootScope.api+"/entities?depicts=true&count=true").then(function(response) {
                    return response.data;
                });
            },
            getRandomEntity: function() {
                return $http.get($rootScope.api+"/entities?random=true").then(function(response) {
                    return response.data[0];
                });
            },
            getSearchEntity: function(keywords, cursor) {
                return $http.get($rootScope.api+"/entities?keyword="+keywords).then(function(response) {
                    return response.data[cursor];
                });
            },
            getSearchEntityNumber: function(keywords) {
                return $http.get($rootScope.api+"/entities?count=true&keyword="+keywords).then(function(response) {
                    return response.data;
                });
            },
            getEntityQwd: function(qwd) {
                return $http.get($rootScope.api+"/entities?qwd="+qwd).then(function(response) {
                    return response.data[0];
                });
            },
            getEntity: function(id) {
                return $http.get($rootScope.api+"/entity/"+id).then(function(response) {
                    return response.data[0];
                });
            }
        };
    })

    .service('LogService', function($http, $rootScope) {
        return {
            getLogs: function() {
                return $http.get($rootScope.api+"/logs").then(function(response) {
                    console.log(response);
                    return response.data;
                });
            },
            getLog: function(id) {
                return $http.get($rootScope.api+"/logs/"+id).then(function(response) {
                    return response.data[0];
                });
            }
        };
    })

    .controller('HomeCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$timeout', '$parse', '$cookies', '$cookieStore', '$interpolate', 'entity', '$transition$', 'nbEntities', 'nbEntitiesDescribed', function($rootScope, $scope, $http, $sce, $state, $timeout, $parse, $cookies, $cookieStore, $interpolate, entity, $transition$, nbEntities, nbEntitiesDescribed) {
        $scope.keywords = {
            search: null,
            loading: false
        };

        $scope.results = {
            number: nbEntities,
            described: nbEntitiesDescribed,
            context: null,
            scope: null,
            keywords: null
        };
        $scope.resultsNumberContext = null;
        if($transition$.params().keywords !== undefined && $transition$.params().keywords !== '' && $transition$.params().keywords !== null) {
            $scope.results.context = "search";
            $scope.results.scope = $transition$.params().scope;
            $scope.results.keywords = $transition$.params().keywords;
        }

        if(entity === undefined || entity === null) {
            $scope.page = {
                status: null,
            };

            if($transition$.params().keywords !== undefined && $transition$.params().keywords !== '' && $transition$.params().keywords !== null) {
                $scope.page.status = "noMoreResults";
            } else {
                $scope.page.status = "404";
            }
        } else {
            /* -- Scope and variables definition -- */
            $scope.page = {
                status: "view",
                loading: true,
                loadThanks: false,
                translation: YAML.load('web/translation.yml')['en']
            };
            $scope.depict = {
                newDepictValue: ""
            };
            $scope.search = {
                language: "en",
                languageDefinition: false,
                searchStr: "",
                id: "searchInput",
                pause: 100,
                selectedObject: "selectedObject",
                url: "https://www.wikidata.org/w/api.php?action=wbsearchentities&language=en&strictlanguage=true&format=json&responselanginfo=true&uselang=en&errorlang=en&search=",
                inputclass: "form-control",
                minLength: 1
            };
            $scope.item = {
                qwd: null,
                image: null,
                imageName: null,
                label: null,
                description: null,
                creator: [],
                creatorLength: 0,
                date_creation: [],
                date_creationLength: 0,
                genre: [],
                genreLength: 0,
                collection: [],
                collectionLength: 0,
                url: [],
                urlLength: 0,
                depicts: [],
                wdtDepicts: [],
                wdtDepictsLength: 0
            };
            $scope.user = {
                ip: null,
                xp: {
                    current: 0,
                    up: 10,
                    down: 0
                },
                level: 1,
                rank: {
                    id: null,
                    computed: null,
                    firsts: null
                }
            };
            $scope.submit = {
                loading: false,
                depictButton: "btn-default"
            };
            /* Variables */

            /* Language modal management */
            if ($cookieStore.get($rootScope.cookie_version+'_histoiredelart_wikidata_id_language') !== undefined) {
                $scope.search.languageDefinition = true;
                $scope.search.language = $cookieStore.get($rootScope.cookie_version+'_histoiredelart_wikidata_id_language');
                $scope.search.url = "https://www.wikidata.org/w/api.php?action=wbsearchentities&language=" + $scope.search.language + "&strictlanguage=true&format=json&responselanginfo=true&uselang=" + $scope.search.language + "&errorlang=" + $scope.search.language + "&search=";
                $scope.page.translation = YAML.load('web/translation.yml')[$scope.search.language];
                for (var elem in $scope.page.translation.home) {
                    $scope.page.translation.home[elem] = $interpolate($scope.page.translation.home[elem])($scope);
                }
            }
            $scope.setLanguage = function (language) {
                $scope.search.languageDefinition = true;
                $scope.search.language = language;
                $scope.page.translation = YAML.load('web/translation.yml')[$scope.search.language];
                $scope.search.url = "https://www.wikidata.org/w/api.php?action=wbsearchentities&language=" + $scope.search.language + "&strictlanguage=true&format=json&responselanginfo=true&uselang=" + $scope.search.language + "&errorlang=" + $scope.search.language + "&search=";
                $cookieStore.put($rootScope.cookie_version+'_histoiredelart_wikidata_id_language', $scope.search.language);
                for (var elem in $scope.page.translation.home) {
                    $scope.page.translation.home[elem] = $interpolate($scope.page.translation.home[elem])($scope);
                }
            };
            for (var elem in $scope.page.translation.home) {
                $scope.page.translation.home[elem] = $interpolate($scope.page.translation.home[elem])($scope);
            }
            /* Language modal management */

            /* HomeTop management */
            if ($cookieStore.get($rootScope.cookie_version+'_histoiredelart_wikidata_id_topmanagement') !== undefined) {
                $scope.topMangement = $cookieStore.get($rootScope.cookie_version+'_histoiredelart_wikidata_id_topmanagement');
            } else {
                $scope.topMangement = "down";
            }
            $scope.topManagement = function () {
                if ($scope.topMangement === "up") {
                    $scope.topMangement = "down";
                    $cookieStore.put($rootScope.cookie_version+'_histoiredelart_wikidata_id_topmanagement', 'down');
                } else if ($scope.topMangement === "down") {
                    $scope.topMangement = 'up';
                    $cookieStore.put($rootScope.cookie_version+'_histoiredelart_wikidata_id_topmanagement', 'up');
                }
            };
            /* HomeTop management */

            /* Game management*/
            if ($cookieStore.get($rootScope.cookie_version+'_histoiredelart_wikidata_id_game_xp') !== undefined) {
                $scope.user.xp.current = $cookieStore.get($rootScope.cookie_version+'_histoiredelart_wikidata_id_game_xp');
                $scope.user.level = $cookieStore.get($rootScope.cookie_version+'_histoiredelart_wikidata_id_game_level');
                $scope.user.rank.id = $cookieStore.get($rootScope.cookie_version+'_histoiredelart_wikidata_id_game_rank_id');

                if ($scope.user.level === 1) {
                    $scope.user.xp.up = 10;
                    $scope.user.xp.down = 0;
                } else if ($scope.user.level > 1) {
                    $scope.user.xp.up = 10 * (Math.pow(2, $scope.user.level - 1));
                    $scope.user.xp.down = 10 * (Math.pow(2, $scope.user.level - 2));
                }

                $http.get($rootScope.api + '/ranks/' + $scope.user.rank.id, {value: $scope.user.xp.current}).then(function (response) {
                    $scope.user.rank.computed = response.data._embedded.computed;
                    $scope.user.rank.firsts = response.data._embedded.firsts;
                });
            } else {
                $cookieStore.put($rootScope.cookie_version+'_histoiredelart_wikidata_id_game_xp', $scope.user.xp.current);
                $cookieStore.put($rootScope.cookie_version+'_histoiredelart_wikidata_id_game_level', $scope.user.level);
                $http.post($rootScope.api + '/ranks', {value: $scope.user.xp.current}).then(function (response) {
                    $cookieStore.put($rootScope.cookie_version+'_histoiredelart_wikidata_id_game_rank_id', response.data.id);
                    $scope.user.rank.computed = response.data._embedded.computed;
                    $scope.user.rank.firsts = response.data._embedded.firsts;
                });
            }
            /* Game management*/

            /* IP management */
            var urlIp = "https://api.ipify.org?format=jsonp";
            var trustedUrlIp = $sce.trustAsResourceUrl(urlIp);
            $http.jsonp(trustedUrlIp, {jsonpCallbackParam: 'callback'})
                .then(function (response) {
                    $scope.user.ip = response.data.ip;
                });
            /* IP management */

            /* Get item */
            $scope.item.qwd = entity.qwd;
            $scope.item.image = entity.image;
            $scope.item.label = entity.label;
            $scope.item.id = entity.id;
            getThumbnail();
            $http.jsonp($sce.trustAsResourceUrl("//www.wikidata.org/w/api.php?action=wbgetentities&ids=Q" + $scope.item.qwd + "&format=json"), {jsonpCallbackParam: 'callback'})
                .then(function (response) {
                    $scope.wdtItem = response.data['entities']["Q" + $scope.item.qwd];
                    generateInfoItem();
                });
            $scope.page.loading = false;

            function generateInfoItem() {
                console.log($scope.wdtItem);
                $scope.item.label = getProperty($scope.wdtItem.labels);
                $scope.item.description = getProperty($scope.wdtItem.descriptions);
                if ($scope.wdtItem.claims["P136"] !== undefined) {
                    /* P136 == Genre */
                    $scope.item.genreLength = $scope.wdtItem.claims["P136"].length;
                    loadClaims($scope.wdtItem.claims["P136"], "genre", "genreLength");
                }
                if ($scope.wdtItem.claims["P571"] !== undefined) {
                    /* P571 == Date of creation */
                    $scope.item.date_creationLength = $scope.wdtItem.claims["P571"].length;
                    loadClaims($scope.wdtItem.claims["P571"], "date_creation", "date_creationLength");
                }
                if ($scope.wdtItem.claims["P170"] !== undefined) {
                    /* P170 == Creator */
                    $scope.item.creatorLength = $scope.wdtItem.claims["P170"].length;
                    loadClaims($scope.wdtItem.claims["P170"], "creator", "creatorLength");
                }
                if ($scope.wdtItem.claims["P195"] !== undefined) {
                    /* P195 == Collection */
                    $scope.item.collectionLength = $scope.wdtItem.claims["P195"].length;
                    loadClaims($scope.wdtItem.claims["P195"], "collection", "collectionLength");
                }
                if ($scope.wdtItem.claims["P973"] !== undefined) {
                    /* P973 == Described at */
                    $scope.item.urlLength = $scope.wdtItem.claims["P973"].length;
                    loadClaims($scope.wdtItem.claims["P973"], "url", "urlLength");
                }

                if ($scope.wdtItem.claims["P180"] !== undefined) {
                    /* P180 == Depicts */
                    $scope.item.wdtDepictsLength = $scope.wdtItem.claims["P180"].length;
                    loadClaims($scope.wdtItem.claims["P180"], "wdtDepicts", "wdtDepictsLength");
                }
            }

            function getThumbnail() {
                $scope.item.imageOriginal = $scope.item.image;
                $scope.item.imageName = decodeURI($scope.item.image);
                $scope.item.imageCommons = $scope.item.imageName.replace("Special:FilePath/", "File:").replace(/ /g, "_").replace(/%2C/g, ",");
                $scope.item.imageName = $scope.item.imageName.replace("http://commons.wikimedia.org/wiki/Special:FilePath/", "").replace(/ /g, "_").replace(/%2C/g, ",");
                var hash = md5($scope.item.imageName);
                $scope.item.image = "https://upload.wikimedia.org/wikipedia/commons/thumb/" + hash.substring(0, 1) + "/" + hash.substring(0, 2) + "/" + $scope.item.imageName + "/400px-" + $scope.item.imageName;
                $http.get($scope.item.image).then(function (response) {
                        //console.log(response);
                    },
                    function (data) {
                        console.log(data);
                        $scope.item.image = $scope.item.imageOriginal;
                    });
            }

            /* Get item */

            /* Actions */
            $scope.submit.newDepict = function () {
                $scope.submit.depictButton = "btn-default";
                $scope.item.depicts.push($scope.search.selectedObject);
                $scope.search.searchStr = "";
                gameCreditDepict();
            };

            $scope.submit.removeDepict = function (dDepict) {
                for (var depict in $scope.item.depicts) {
                    if (dDepict['qwd'] === $scope.item.depicts[depict]['qwd']) {
                        $scope.item.depicts.splice(depict, 1);
                    }
                }
            };

            $scope.submit.persist = function () {
                gameCreditSubmit();
                $scope.submit.loading = true;
                $scope.page.loadThanks = true;
                if ($scope.item.depicts.length > 0) {
                    var qwds = [];
                    for (var depict in $scope.item.depicts) {
                        qwds.push($scope.item.depicts[depict]['qwd']);
                    }
                    $http.patch($rootScope.api + '/entities/' + $scope.item.id, {"listDepicts": qwds}).then(function (response) {
                        $http.post($rootScope.api + '/logs', {
                            "status": "updateDepicts",
                            "ip": $scope.user.ip,
                            "entity": $scope.item.id
                        }).then(function (response) {
                            reload();
                        });
                    });

                }
            };

            $scope.submit.nothingToAdd = function () {
                $scope.submit.loading = true;
                $http.post($rootScope.api + '/logs', {
                    "status": "nothingToAdd",
                    "ip": $scope.user.ip,
                    "entity": $scope.item.id
                }).then(function (response) {
                    reload();
                });
            };

            $scope.submit.pass = function () {
                $scope.submit.loading = true;
                $http.post($rootScope.api + '/logs', {
                    "status": "pass",
                    "ip": $scope.user.ip,
                    "entity": $scope.item.id
                }).then(function (response) {
                    reload();
                });
            };
            /* Actions */

            /* AnguComplete Fork */
            $scope.processResults = function (responseData, str) {
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

            $scope.searchTimerComplete = function () {
                if ($scope.search.searchStr.length >= $scope.search.minLength) {
                    $http.jsonp($sce.trustAsResourceUrl($scope.search.url + $scope.search.searchStr), {jsonpCallbackParam: 'callback'})
                        .then(function (responseData, status, headers, config) {
                            console.log(responseData.data);
                            $scope.search.searching = false;
                            $scope.processResults(responseData.data['search'], $scope.search.searchStr);
                        });
                }
            };

            $scope.hideResults = function () {
                $scope.search.hideTimer = $timeout(function () {
                    $scope.search.showDropdown = false;
                }, $scope.search.pause);
            };

            $scope.resetHideResults = function () {
                if ($scope.search.hideTimer) {
                    $timeout.cancel($scope.search.hideTimer);
                }
            };

            $scope.hoverRow = function (index) {
                $scope.search.currentIndex = index;
            };

            $scope.selectResult = function (result) {
                if ($scope.search.matchClass) {
                    result.search.label = result.label.toString().replace(/(<([^>]+)>)/ig, '');
                }
                $scope.search.searchStr = $scope.search.lastSearchTerm = result.label;
                $scope.search.selectedObject = result;
                $scope.search.showDropdown = false;
                $scope.search.results = [];
                //$scope.$apply();
            };

            $scope.$watch('search.searchStr', function () {
                if($scope.search.searchStr !== '' && $scope.search.searchStr !== null) {
                    $scope.submit.depictButton = "btn-success";
                } else {
                    $scope.submit.depictButton = "btn-default";
                }

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
            function loadClaims(claimP180, scopeName, scopeLength) {
                for (var iClaim in claimP180) {
                    var entry = claimP180[iClaim];

                    if (entry.mainsnak.datatype === "time") {
                        var datavalue = entry.mainsnak.datavalue;
                        $scope.item[scopeName].push({
                            label: datavalue.value.time,
                            date: new Date(datavalue.value.time.substr(1)),
                            type: "time",
                            precision: datavalue.value.precision
                        });
                        console.log($scope.item);
                    } else if (entry.mainsnak.datavalue.value.id !== undefined) {
                        var url = "//www.wikidata.org/w/api.php?action=wbgetentities&ids=" + entry.mainsnak.datavalue.value.id + "&format=json";
                        var trustedUrl = $sce.trustAsResourceUrl(url);

                        $http.jsonp(trustedUrl, {jsonpCallbackParam: 'callback'})
                            .then(function (response) {
                                $scope.item[scopeName].push(response.data['entities']);
                                encodeClaims(scopeName, scopeLength);
                            });
                    }
                }
            }

            function encodeClaims(scopeName, scopeLength) {
                //console.log($scope.depict[scopeName]);
                if ($scope.item[scopeName].length === $scope.item[scopeLength]) {
                    var newScopeValue = [];
                    for (var wdtClaimId in $scope.item[scopeName]) {
                        var wdtClaim = $scope.item[scopeName][wdtClaimId];
                        for (var itemQwd in wdtClaim) {
                            var item = wdtClaim[itemQwd];
                            if (item.labels !== undefined) {
                                newScopeValue.push({qwd: itemQwd, label: getClaimLabel(item.labels), type: "entity"});
                            }
                        }
                    }
                    $scope.item[scopeName] = newScopeValue;
                    //console.log($scope.item[scopeName]);
                }
            }

            function getClaimLabel(labels) {
                //console.log(labels);
                if (labels[$scope.search.language] !== undefined) {
                    return labels[$scope.search.language].value;
                } else if (labels.en !== undefined) {
                    return labels.en.value;
                } else if (labels.fr !== undefined) {
                    return labels.fr.value;
                } else if (labels.it !== undefined) {
                    return labels.it.value;
                } else if (labels.de !== undefined) {
                    return labels.de.value;
                } else if (labels.nl !== undefined) {
                    return labels.nl.value;
                } else if (labels.es !== undefined) {
                    return labels.es.value;
                }
            }

            /* Function: depicts */


            /* Object Browser for Wikidata */
            function getProperty(property) {
                if (property[$scope.search.language] !== undefined) {
                    return property[$scope.search.language].value;
                } else if (property.en !== undefined) {
                    return property.en.value;
                } else if (property.fr !== undefined) {
                    return property.fr.value;
                } else if (property.it !== undefined) {
                    return property.it.value;
                } else if (property.de !== undefined) {
                    return property.de.value;
                } else if (property.nl !== undefined) {
                    return property.nl.value;
                } else if (property.es !== undefined) {
                    return property.es.value;
                } else {
                    return "";
                }
            }

            /* Game management*/
            function gameCreditDepict() {
                $scope.user.xp.current += 1;
            }

            function gameCreditSubmit() {
                $scope.user.xp.current += 3;
            }

            $scope.$watch('user.xp.current', function () {
                $scope.user.level = Math.ceil($scope.user.xp.current / 10);
                $cookieStore.put($rootScope.cookie_version+'_histoiredelart_wikidata_id_game_level', $scope.user.level);

                if ($scope.user.xp.current > $scope.user.xp.up) {
                    $scope.user.xp.down = $scope.user.xp.up;
                    $scope.user.xp.up = $scope.user.xp.up * 2;
                }

                $cookieStore.put($rootScope.cookie_version+'_histoiredelart_wikidata_id_game_xp', $scope.user.xp.current);
                $http.patch($rootScope.api + '/ranks/' + $scope.user.rank.id, {value: $scope.user.xp.current}).then(function (response) {
                    console.log(response.data);
                    $scope.user.rank.computed = response.data._embedded.computed;
                    $scope.user.rank.firsts = response.data._embedded.firsts;
                });
            });
            $scope.progressbar = function () {
                if ($scope.user.level === 1) {
                    return 'progress-bar-info';
                }
                else if ($scope.user.level === 2) {
                    return 'progress-bar-info progress-bar-striped';
                }
                else if ($scope.user.level === 3) {
                    return '';
                }
                else if ($scope.user.level === 4) {
                    return 'progress-bar-striped';
                }
                else if ($scope.user.level === 5) {
                    return 'progress-bar-success';
                }
                else if ($scope.user.level === 6) {
                    return 'progress-bar-success progress-bar-striped';
                }
                else if ($scope.user.level === 7) {
                    return 'progress-bar-warning';
                }
                else if ($scope.user.level === 8) {
                    return 'progress-bar-warning progress-bar-striped';
                }
                else if ($scope.user.level === 9) {
                    return 'progress-bar-danger';
                }
                else if ($scope.user.level >= 10) {
                    return 'progress-bar-danger progress-bar-striped';
                }
            };
            /* Game management*/

            /* Time management */
            $scope.century = function(date) {
                console.log(date);
                return parseInt(date.substring(1,3))+1;
            };
            $scope.decade = function(date) {
                return date.substring(1,4)+"0's";
            };
            /* Time management */
        }

        /* LookingFor management */
        $scope.keywords.action = function () {
            $scope.keywords.loading = true;
            console.log($scope.keywords.search);
            reload();
        };
        /* LookingFor management */

        function reload() {
            if($scope.keywords.search !== undefined && $scope.keywords.search !== '' && $scope.keywords.search !== null) {
                $state.go("home", {keywords: $scope.keywords.search, cursor: 0});
            } else if($transition$.params().keywords !== undefined && $transition$.params().keywords !== '' && $transition$.params().keywords !== null) {
                $state.go("home", {keywords: $transition$.params().keywords, cursor: parseInt($transition$.params().cursor)+1});
            } else {
                $state.reload();
            }
        }
    }])
;