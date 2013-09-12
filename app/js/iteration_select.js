tcmModule.directive('iterationSelect', function(){
    return {
        restrict: 'E',
        transclude: true,
       /* scope: {
          name: @name
        },*/
        templateUrl: 'app/partials/iteration_select.html',
        controller: ["$scope", "$element", "$attrs", "$transclude", "tcm_model", "$routeParams", function($scope, $element, $attrs, $transclude, tcm_model, $routeParams){

            $scope.iterations = Array();
            $scope.id = "iteration-select";



            tcm_model.getIterations(function(data){
                    for(var i = 0 ; i < data.length ; i++){


                        for(var j = 0; j<data[i].iterations.length; j++){

                            $scope.iterations.push({"release": data[i].name,
                             "id":  data[i].iterations[j].id,
                             "name": data[i].iterations[j].name});
                        }
                    }


                },
                function(){
                   console.log("error");
                }
            );

        }],

        link: function (scope, iterStartElement, attr, tcm_model) {

        }
    }
});