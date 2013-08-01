function TopMenuCntl($scope, $route, $routeParams, $location, $cookieStore, Auth) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;

    $scope.topmenu = 'app/partials/topmenu.html';

    $scope.userName = Auth.user.username;

    $scope.logout = function(){
        Auth.logout(function(){
            $location.path('/login');
        });

    } ;
}

TopMenuCntl.$inject = ['$scope', '$route', '$routeParams', '$location', '$cookieStore', 'Auth'];