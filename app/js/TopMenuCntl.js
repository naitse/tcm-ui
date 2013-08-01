function TopMenuCntl($scope, $route, $routeParams, $location, $cookieStore, Auth) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;

    $scope.topmenu = 'app/partials/topmenu.html';

    $scope.userName = Auth.user.username;

    $scope.switchProjectModalClass = 'modal hide fade';

    $scope.logout = function(){
        Auth.logout(function(){
            $location.path('/login');
        });

    } ;

    $scope.switchProjectModal = function(){
        $scope.switchProjectModalClass = 'modal fade';
    };
}

TopMenuCntl.$inject = ['$scope', '$route', '$routeParams', '$location', '$cookieStore', 'Auth'];