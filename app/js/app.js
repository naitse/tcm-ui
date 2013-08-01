'use strict';

var tcmModule = angular.module('tcm', ['ngCookies']).
    config(['$routeProvider', '$locationProvider', '$httpProvider',
        function($routeProvider, $locationProvider, $httpProvider ) {
            var access = routingConfig.accessLevels;

            $routeProvider.when('/manager/:projectId',
                                {templateUrl: '/app/partials/manager.html',
                                 controller: ManagerCntl,
                                 access: access.user
                                }).when('/login',
                                {
                                    templateUrl: 'app/partials/login.html',
                                    controller: 'LoginCtrl',
                                    access: access.anon
                                }).
               otherwise({redirectTo:'/login'});

            //$locationProvider.html5Mode(true);


            var interceptor = ['$location', '$q', function($location, $q) {
                function success(response) {

                    return response;
                }

                function error(response) {

                    if(response.status === 401) {
                        $location.path('/login');
                        return $q.reject(response);
                    }
                    else {
                        return $q.reject(response);
                    }
                }

                return function(promise) {
                    return promise.then(success, error);
                }
            }];

            $httpProvider.responseInterceptors.push(interceptor);

        }]).filter('range', function() {
        return function(input, total) {
            total = parseInt(total);
            for (var i=0; i<total; i++)
                input.push(i);
            return input;
        }
    });

tcmModule.directive('chosen',function(){
    var linker = function(scope,element,attrs) {
        var list = attrs['chosen'];

        scope.$watch(list, function(){
            element.trigger('liszt:updated');
        });

        element.chosen();
    };

    return {
        restrict:'A',
        link: linker
    }
})


tcmModule.run(['$rootScope', '$location', 'Auth', function ($rootScope, $location, Auth) {

    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        $rootScope.error = null;

        if (!Auth.authorize(next.access)) {
            if(Auth.isLoggedIn()) $location.path('/manager');
            else $location.path('/login');
        }
    });

}]);
