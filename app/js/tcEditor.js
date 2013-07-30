tcmModule.directive('tcEditor', function(){
   return {
       restrict: 'E',
       transclude: true,
       templateUrl: 'app/partials/tc-editor.html',
       controller: ["$scope", "$element", "$attrs", "$transclude", "$http", "$routeParams", function($scope, $element, $attrs, $transclude, $http, $routeParams){
           $scope.mode = "Add";

           $scope.$watch('selectedTC', function(val){
               if(val!=null){
                $scope.mode = "Update";
               }
           });

           $scope.save = function(){

               if($scope.mode == "Update"){
                   objectToSave ={
                       name:$scope.selectedTC.name,
                       description: $scope.selectedTC.description,
                       proposed: ($scope.selectedTC.proposed == "true")? 1 : 0
                   }

                   $scope.mode = 'saving...';

                   $http.put($scope.basePath + 'api/releases/31/iterations/14/features/138/testcases/'+$scope.selectedTC.tcId+'?apiKey='+$scope.apiKey+'&projectId='+$routeParams.projectId, JSON.stringify(objectToSave)).
                       success(function(data, status, headers, config) {

                           console.log(data, status, headers, config);
                           $scope.mode = 'Update';
                       }).
                       error(function(data, status, headers, config) {
                           console.log("Request failed");
                           $scope.mode = 'Update';
                       });

                   /*tcmModel.releases.iterations.features.test_cases.update(self.context.releaseId, self.context.iterationId, self.context.featureId, objectToSave).done(function(){

                       self.afterUpdate(objectToSave);

                       editorWrapper.find('.save').button('complete');

                   }).fail(function(){
                           editorWrapper.find('.alert').removeClass('hide')
                       });*/
               }

           }

       }],
       link: function (scope, iterStartElement, attr) {

           console.log(scope);
       }
   }
});