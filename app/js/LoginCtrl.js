tcmModule.controller('LoginCtrl',
    ['$rootScope', '$scope', '$location', '$window', 'Auth', '$cookieStore', 'tcm_model', function($rootScope, $scope, $location, $window, Auth, $cookieStore, tcm_model) {
        $scope.loginErrorMessage = "";
        $scope.alertClass = "login-alert hide";
        $scope.displayButton = true;
        $scope.displayProjects = false;
        $scope.projects = null;
        $scope.loginFormStyle ="";

        $scope.login = function() {
            Auth.login({
                    username: $scope.username,
                    password: $scope.password,
                    rememberme: $scope.rememberme,
                    role: Auth.userRoles.user //so far all roles are user or anon
                },
                function(res) {

                    $cookieStore.put('user', res);

                    $scope.loginFormStyle = {height: "310"};
                    $scope.loginErrorMessage = 'User authenticated, Please select a project';
                    $scope.alertClass = 'login-alert alert-success';
                    $scope.displayButton = false;
                    $scope.displayProjects = true;

                    $scope.$broadcast('loadProjectSelect', "kk");

                },
                function(err) {
                    $scope.loginErrorMessage ='Authentication error';
                    $scope.alertClass = 'login-alert alert-danger';
                    $rootScope.error = "Failed to login";
                });
        };

        $scope.continueToManager = function(){
            if(Auth.isLoggedIn){
                $location.path('/manager/' + $scope.project.id);
            }
        };

        $scope.loginOnEnter = function(event){

            //console.log(event);

        };

    }]);