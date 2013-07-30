

function ManagerCntl($scope, $routeParams, $http, $rootScope) {
    console.log('ManagerCntl');
    $scope.basePath = "http://tcm-backend-qa.cloudhub.io/"
    $scope.apiKey = "b79f712c-f6ec-4407-ab6d-ec9b3fc50af6";

    $scope.getReleases = function() {
        $http({method: 'GET', url: $scope.basePath + 'api/releases_iterations?apiKey='+$scope.apiKey+'&projectId='+$routeParams.projectId }).
            success(function(data, status, headers, config) {

                for(var i = 0; i< data.length;i++){
                    data[i].display = 'none';
                }

                $scope.releases = data;
                $scope.releasesTitle = "Releases";
                $scope.releasesView = 'app/partials/releases_iterations.html';
            }).
            error(function(data, status, headers, config) {
                console.log("Request failed");
                $scope.releasesView = 'app/partials/releases_iterations.html';
            });

    };

    $scope.getExecutedTestCases = function(releaseId, iterationId, featureId){

        $http({method: 'GET', url: $scope.basePath + 'api/releases/67/iterations/59/features/' + featureId + '/executedtestcases?apiKey='+$scope.apiKey+'&projectId='+$routeParams.projectId }).
            success(function(data, status, headers, config) {


                for(var i = 0; i< $scope.features.length;i++){

                    if($scope.features[i].featureId == featureId){

                        $scope.features[i].execution = data[0];
                        $scope.features[i].executedTestCases = parseInt(data[0].total) - parseInt(data[0].notrun);
                        $scope.features[i].totalTestCases = data[0].total;

                        if(data[0].total != 0 && data[0].total == data[0].pass){
                            $scope.features[i].jiraStatus = 'ready'


                        }else if(data[0].total != 0 && data[0].state == 0){
                            $scope.features[i].displayCloseButton = "disabled=true"
                        }else{
                            $scope.features[i].jiraStatus = "";
                            $scope.features[i].displayCloseButton = "disabled=true"
                        }
                    }
                }
            }).
            error(function(data, status, headers, config) {
                console.log("Request failed");
            });
    };

    $scope.showFeatures = function(release, iteration){
        $http({method: 'GET', url: $scope.basePath + 'api/releases/'+release.id+'/iterations/'+iteration.id+'/features?apiKey='+$scope.apiKey+'&projectId='+$routeParams.projectId }).
            success(function(data, status, headers, config) {

                $scope.backButton = 'inline';
                $scope.features = data;
                $scope.releasesView = 'app/partials/features.html';
                $scope.releasesTitle = release.name + '/' + iteration.name;

                for(var i=0; i < data.length; i++){
                    $scope.getExecutedTestCases(release.id, iteration.id, data[i].featureId);
                }



            }).
            error(function(data, status, headers, config) {
                console.log("Request failed");
                $scope.releasesView = 'app/partials/releases_iterations.html';
            });

    };


    $scope.getTestCases = function(featureId){
        $http({method: 'GET', url: $scope.basePath + 'api/releases/1/iterations/0/features/'+featureId+'/testcases?apiKey='+$scope.apiKey+'&projectId='+$routeParams.projectId }).
            success(function(data, status, headers, config) {

                $scope.feature_testcases = data;
                for(var i=0; i< $scope.feature_testcases.length; i++){
                    $scope.feature_testcases[i].displayDetails = 'none';
                    switch(parseInt($scope.feature_testcases[i].statusId))
                    {
                        case 0:
                            $scope.feature_testcases[i].statusClass = 'ddm-notrun'
                            $scope.feature_testcases[i].statusIcon = 'icon-off'
                            break;
                        case 1:
                            $scope.feature_testcases[i].statusClass = 'ddm-inprogress'
                            $scope.feature_testcases[i].statusIcon = 'icon-hand-right '
                            break;
                        case 2:
                            $scope.feature_testcases[i].statusClass = 'ddm-block'
                            $scope.feature_testcases[i].statusIcon = 'icon-exclamation-sign '
                            break;
                        case 3:
                            $scope.feature_testcases[i].statusClass = 'ddm-failed'
                            $scope.feature_testcases[i].statusIcon = 'icon-thumbs-down icon-white '
                            break;
                        case 4:
                            $scope.feature_testcases[i].statusClass = 'ddm-pass'
                            $scope.feature_testcases[i].statusIcon = 'icon-thumbs-up icon-white '
                            break;
                        default:
                            $scope.feature_testcases[i].statusClass = ''
                            $scope.feature_testcases[i].statusIcon = 'icon-hand-right icon-white '
                    }

                }

                $scope.testCasesView = 'app/partials/testcases.html';
            }).
            error(function(data, status, headers, config) {
                console.log("Request failed");
                $scope.testCasesView = '';
            });

    };

    $scope.showFeatureDetails = function(feature){
        $scope.selectedFeature = feature;
        $scope.featuresDetailsView = 'app/partials/feature_details.html';

        $scope.getTestCases(feature.featureId);
    };

    $scope.params = $routeParams;

    $scope.displayIterations = function(index){

        for(var i = 0 ; i<$scope.releases.length; i++){
            $scope.releases[i].display = 'none';
        }


        $scope.releases[index].display = 'inline';
    };

    $scope.backToReleases = function(){
        $scope.releasesView = 'app/partials/releases_iterations.html';
    };

    $scope.showTCDetails = function(tc){
        tc.displayDetails = tc.displayDetails == 'none'? 'inline': 'none';
    };

    $scope.selectTC = function(tc){
        $scope.selectedTC = tc;
    };

    $scope.releasesView = 'app/partials/releases_iterations.html';
    $scope.testCasesView = '';
    $scope.backButton = 'none';
    $scope.releasesTitle = "Releases";
    $scope.selectedTC = null;
    $scope.getReleases();

}
ManagerCntl.$inject = ['$scope', '$routeParams', '$http', '$rootScope'];