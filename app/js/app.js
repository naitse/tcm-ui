'use strict';

angular.module('tcm', []).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            //when('/manager', {templateUrl: 'partials/manager.html', controller: PhoneListCtrl}).
            when('/manager/:projectId', {templateUrl: 'app/partials/manager.html', controller: ManagerCntl}).
            otherwise({redirectTo: '/manager'});
    }]);