tcmModule.directive('tcEditor', function(){
   return {
       restrict: 'E',
       transclude: true,
       templateUrl: 'app/partials/tc-editor.html',
       controller: ["$scope", "$element", "$attrs", "$transclude", "$http", "$routeParams", function($scope, $element, $attrs, $transclude, $http, $routeParams){

           $scope.editorActiveMode = 1;
           $scope.btnText = "Add";
           $scope.editorTitle = "New Test Case"
           $scope.displayEditor = false;

           $scope.mode = {
               add: { id: 1, name: 'Add'},
               update: { id: 2, name: 'Update'},
               run: { id: 3, name: 'Run'}
           };


           $scope.$watch('editorActiveMode', function(val){

               if($scope.editorActiveMode == $scope.mode['update'].id){

                   $scope.editorTitle = "Update Test Case"
                   $scope.btnText =  $scope.mode['update'].name;

               }else if($scope.editorActiveMode == $scope.mode['add'].id){
                   $scope.editorTitle = "New Test Case"
                   $scope.btnText =  $scope.mode['add'].name;
               }

           });

           $scope.save = function(){

               var objectToSave ={
                   name:$scope.selectedTC.name,
                   description: $scope.selectedTC.description,
                   proposed: ($scope.selectedTC.proposed == "true")? 1 : 0
               }

               if($scope.editorActiveMode == $scope.mode['update'].id){


                   $scope.btnText = 'saving...';

                   $http.put($scope.basePath + 'api/releases/31/iterations/14/features/'+$scope.selectedFeature.featureId+'/testcases/'+$scope.selectedTC.tcId+'?apiKey='+$scope.apiKey+'&projectId='+$routeParams.projectId, JSON.stringify(objectToSave)).
                       success(function(data, status, headers, config) {

                           $scope.editorActiveMode = 2;
                       }).
                       error(function(data, status, headers, config) {

                           $scope.editorActiveMode = 2;
                       });
               }

               if($scope.editorActiveMode == $scope.mode['add'].id){
                   $scope.btnText = 'saving...';
                   $http.post($scope.basePath + 'api/releases/31/iterations/14/features/'+$scope.selectedFeature.featureId+'/testcases?apiKey='+$scope.apiKey+'&projectId='+$routeParams.projectId, JSON.stringify(objectToSave)).
                       success(function(data, status, headers, config) {
                           console.log(headers());
                           $scope.editorActiveMode = 2;
                       }).
                       error(function(data, status, headers, config) {

                           $scope.btnText = 'Add';
                       });
               }

           };

           $scope.cancelEdit = function(){
               $scope.leftWrapperStyle = {width: "100%", height: "96.30996309963099%"};
               $scope.displayEditor = true;
           };

       }],

       link: function (scope, iterStartElement, attr) {


       }
   }
});