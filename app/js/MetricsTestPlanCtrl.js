

function MetricsTestPlanCtrl($scope, $routeParams, $http, $rootScope, tcm_model, $timeout) {

    $scope.displayControls = true;
    $scope.permalink = "";
    $scope.permalinkDisabled = true;
    $scope.progress = 0;
    $scope.displayPlanContainer = false;

    $scope.alerts = Array();

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.displayPlan = function(){
        $('#btnGetPlan').button('loading');

        $scope.displayProgressBar = true;
        $scope.displayPlanContainer = false;
        $scope.progress = 10;

        tcm_model.getIterationPlan($scope.iteration, function(data, status, headers, config){

            if(data.length == 0 ){
                $scope.alerts.push ( { type: 'error', msg: 'No Test Cases found for given iteration!' } );
            }else{
                $scope.permalinkDisabled = false;
                $scope.progress = 40;

                for(var i = 0; i< data.length; i++)
                {
                    data[i].isColapsed = true;
                }
                $scope.coverageData = data;

                $scope.progress = 10

                $scope.displayProgressBar =false;
                $scope.displayPlanContainer = true;

            }

            $('#btnGetPlan').button('reset');

        }, function(){
            $scope.alerts.push ( { type: 'error', msg: 'Errors!' } );
            $scope.displayProgressBar = false
        });

    };

    if($routeParams.iterationId != null){
        $scope.displayControls = false;
        $scope.iteration = $routeParams.iterationId;
        $scope.displayPlan();
    }


    $scope.getPermaLink = function(){
        var wl = window.location;
        $scope.permalink =  wl.protocol + '//' + wl.hostname + wl.pathname + '#testplan/'+ $routeParams.projectId + '/' + $scope.iteration;

        console.log($scope.permalink);

    };

}
MetricsTestPlanCtrl.$inject = ['$scope', '$routeParams', '$http', '$rootScope', 'tcm_model', '$timeout'];