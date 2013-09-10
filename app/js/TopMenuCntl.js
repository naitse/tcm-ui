function TopMenuCntl($scope, $route, $routeParams, $location, $cookieStore, Auth) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;

    $scope.menuList = [
        {
            name: 'TCM',
            active: $location.path().indexOf('manager') >=0 || $location.path().indexOf('suites')>=0 ? 'active':'',
            subMenuList: [
                    {
                        name: "Iterations",
                        link: '#/manager/'+$routeParams.projectId,
                        active: $location.path().indexOf('manager') >=0 ? 'active':''
                    },
                    {
                        name: "Suites",
                        link: '#/suites',
                        active: $location.path().indexOf('suites') >=0 ? 'active':''
                    }
                ]
        },
        {
            name: 'Metrics',
            active: $location.path().indexOf('testplan') >=0 || $location.path().indexOf('rlsmetrics')>=0 || $location.path().indexOf('/metrics')>=0 ? 'active':'',
            subMenuList: [
                { name: 'TestPlan',
                  active: $location.path().indexOf('testplan') >=0 ? 'active':'',
                  link: '#/testplan'
                },
                { name: 'Release',
                  active: $location.path().indexOf('rlsmetrics') >=0 ? 'active':'',
                    link: '#/rlsmetrics'
                },
                { name: 'Iteration',
                  active: $location.path().indexOf('/metrics') >=0 ? 'active':'',
                    link: '#/metrics'
                }]
        },
        {
            name: 'Plugins',
            active: $location.path().indexOf('sync') >=0 || $location.path().indexOf('import-export')>=0 ? 'active':'',
            subMenuList:[
                { name: 'JIRA Sync',
                  active: $location.path().indexOf('sync') >=0 ? 'active':'',
                    link: '#/sync'
                },
                { name: 'Import/Export',
                    active: $location.path().indexOf('import-export') >=0 ? 'active':'',
                    link: '#/import-export'
                }
            ]
        }
    ];

    function isActive(){
        //$routeParams
    }
    $scope.topmenu = 'app/partials/topmenu.html';

    $scope.userName = Auth.user.username;

    $scope.switchProjectModalClass = 'modal hide fade';

    $scope.logout = function(){
        Auth.logout(function(){
            $location.path('/login');
        });

    } ;

    $scope.switchProjectModal = function(){
        $scope.$broadcast('loadProjectSelect', "kk");

    };

    $scope.isActiveMenu = function(element){
        console.log(element);
        return 'active';
    }
}

TopMenuCntl.$inject = ['$scope', '$route', '$routeParams', '$location', '$cookieStore', 'Auth'];