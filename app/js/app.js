'use strict';

var tcmModule = angular.module('tcm', []).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/manager/:projectId', {templateUrl: 'app/partials/manager.html', controller: ManagerCntl}).
            otherwise({redirectTo: '/login.html'});
    }]).filter('range', function() {
        return function(input, total) {
            total = parseInt(total);
            for (var i=0; i<total; i++)
                input.push(i);
            return input;
        }
    });

