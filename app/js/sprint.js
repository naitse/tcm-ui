tcmModule.directive('sprintProgress', function(){
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'app/partials/sprint.html',
        controller: ["$scope", "$element", "$attrs", "$transclude", "tcm_model", "$routeParams", function($scope, $element, $attrs, $transclude, tcm_model, $routeParams){
            $scope.displayConfigPanel = false;

            $scope.barClass = function(i, j){

                var index = (i * 5) + j

                var classRet = "";

                 if(index < $scope.days_per_iteration){
                     classRet = 'bar-success';
                 }else if(index == $scope.days_per_iteration){
                     classRet = 'bar-warning';

                   // $(this).parents('.progress').addClass('progress-striped active');
                 }else if(index > $scope.days_per_iteration){
                     classRet = 'bar-notrun';
                 }

                return classRet;

            }

            $scope.bizdays = function(d1, d2){

                var wd1= d1.getDay();
                var wd2= d2.getDay();

                var interval= Math.abs(d1-d2);
                var days= Math.floor(interval/8.46e7);
                var tem= days%7;
                var weeks= Math.floor(days/7);
                if(wd1== 6) tem-= 2;
                else if(wd1== 0) tem-= 1;
                if(wd2== 0) tem-= 1;

                return weeks*5+tem;
            };

            $scope.guidGenerator= function() {
                var buf = new Uint16Array(8);
                window.crypto.getRandomValues(buf);
                var S4 = function(num) {
                    var ret = num.toString(16);
                    while(ret.length < 4){
                        ret = "0"+ret;
                    };
                    return ret;
                };
                return (S4(buf[0])+S4(buf[1])+"-"+S4(buf[2])+"-4"+S4(buf[3]).substring(1)+"-y"+S4(buf[4]).substring(1)+"-"+S4(buf[5])+S4(buf[6])+S4(buf[7]));
            };

            tcm_model.getProjectConfiguration(function(data){
                if(data.length > 0){
                    $scope.bug_url = data[0].bugurl;
                    $scope.springIterations = data[0].springIterations;
                    $scope.iterationDuration = data[0].iterationDuration * 5;
                    $scope.id = data[0].id;
                    $scope.currentrelease = data[0].currentrelease;


                    var currentDate = new Date();

                    var currentR = {
                        year:data[0].currentrelease.split('/')[0],
                        month:data[0].currentrelease.split('/')[1],
                        day:data[0].currentrelease.split('/')[2],
                    }

                    var current_date = {
                        "year":currentDate.getFullYear(),
                        "month":currentDate.getMonth(),
                        "day":currentDate.getDate()
                    }

                    var startD = new Date(currentR.year,currentR.month,currentR.day);

                    var today = new Date(current_date.year,current_date.month,current_date.day);

                    $scope.days_per_iteration = $scope.bizdays(startD, today);;

                    $scope.timeLineId = $scope.guidGenerator();

                }}, function(data){
                    console.log('error', data);
                });

        }],

        link: function (scope, iterStartElement, attr) {


        }
    }
});