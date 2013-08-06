tcmModule.directive('projectSelect', function(){
    return {
        restrict: 'E',
        transclude: true,
       /* scope: {
          name: @name
        },*/
        templateUrl: 'app/partials/project_select.html',
        controller: ["$scope", "$element", "$attrs", "$transclude", "tcm_model", "$routeParams", function($scope, $element, $attrs, $transclude, tcm_model, $routeParams){

            $scope.projects = null;
            $scope.id = "project-select"

            $scope.$on('loadProjectSelect', function(event, msg) {
                console.log($scope.name)
                tcm_model.getProjects(function(data){
                        $scope.projects = data;
                    },
                    function(){

                    }
                );
            });
        }],

        link: function (scope, iterStartElement, attr) {

        }
    }
});