

function ManagerCntl($scope, $routeParams, $http, $rootScope, tcm_model) {

    $scope.showAddTestCase = false;
    $scope.showCopyTestCase = false;
    $scope.leftWrapperStyle = {width: "100%", height: "96.30996309963099%"};

    $scope.getReleases = function() {

        tcm_model.getReleases(function(data, status, headers, config) {

            for(var i = 0; i< data.length;i++){
                data[i].display = 'none';
            }

            $scope.releases = data;
            $scope.releasesTitle = "Releases";
            $scope.releasesView = 'app/partials/releases_iterations.html';

        }, function(data, status, headers, config) {
            console.log("Request failed");
            $scope.releasesView = 'app/partials/releases_iterations.html';
        });
    };

    $scope.getExecutedTestCases = function(featureId){

        tcm_model.getExecutedTestCases(featureId,
            function(data, status, headers, config) {
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
            },
            function(data, status, headers, config) {
                console.log("Request failed");
            }
        );
    };

    $scope.showFeatures = function(release, iteration){
        tcm_model.getFeatures(release, iteration,
            function(data, status, headers, config) {


                $scope.backButton = true;
                $scope.features = data;
                $scope.releasesView = 'app/partials/features.html';
                $scope.releasesTitle = release.name + '/' + iteration.name;

                for(var i=0; i < data.length; i++){
                    $scope.getExecutedTestCases(data[i].featureId);
                }
            },
            function(data, status, headers, config) {
                console.log("Request failed");
                $scope.releasesView = 'app/partials/releases_iterations.html';
            }
        );

    };


    $scope.getTestCases = function(featureId){

        tcm_model.getTestCases(featureId, function(data, status, headers, config) {

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
            },function(data, status, headers, config) {
                console.log("Request failed");
                $scope.testCasesView = '';
            });

    };

    $scope.showFeatureDetails = function(feature){
        $scope.showAddTestCase = true;
        $scope.showCopyTestCase = true;
        $scope.selectedFeature = feature;
        $scope.displayEditor = false;
        $scope.editorActiveMode = 1;
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
        $scope.leftWrapperStyle = {width: "65%"};
        $scope.editorWraperStyle = {width: "481px"};
        $scope.displayEditor = true;
        $scope.editorActiveMode = 2;
        $scope.selectedTC = tc;
    };

    $scope.btnNewTestCase = function(){

        $scope.selectedTC = {
            name:"",
            description: "",
            proposed: 0
        };
        $scope.leftWrapperStyle = {width: "65%"};
        $scope.editorWraperStyle = {width: "481px"};
        $scope.editorActiveMode = 1;
        $scope.displayEditor = true;
    }




    $scope.releasesView = 'app/partials/releases_iterations.html';
    $scope.testCasesView = '';
    $scope.backButton = false;
    $scope.releasesTitle = "Releases";

    $scope.getReleases();

}
ManagerCntl.$inject = ['$scope', '$routeParams', '$http', '$rootScope', 'tcm_model'];