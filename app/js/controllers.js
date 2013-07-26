function TopMenuCntl($scope, $route, $routeParams, $location) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;
}

function ManagerCntl($scope, $routeParams) {
    $scope.releases = [
        {
            "id": 31,
            "name": "30",
            "start": null,
            "end": null,
            "iterations": [
                {
                    "id": 14,
                    "name": "Iteration 17"
                },
                {
                    "id": 15,
                    "name": "Iteration 19"
                },
                {
                    "id": 16,
                    "name": "Iteration 20"
                },
                {
                    "id": 18,
                    "name": "R30 Imp week it21"
                },
                {
                    "id": 31,
                    "name": "STG pre-release"
                }
            ]
        },
        {
            "id": 33,
            "name": "31",
            "start": null,
            "end": null,
            "iterations": [
                {
                    "id": 19,
                    "name": "Iteration 21"
                },
                {
                    "id": 21,
                    "name": "Iteration 22"
                },
                {
                    "id": 32,
                    "name": "Iteration 23"
                },
                {
                    "id": 49,
                    "name": "Iteration 24"
                },
                {
                    "id": 57,
                    "name": "STG regression"
                },
                {
                    "id": 58,
                    "name": "PROD imp"
                }
            ]
        },
        {
            "id": 67,
            "name": "32",
            "start": 1374451200000,
            "end": 1376611200000,
            "iterations": [
                {
                    "id": 59,
                    "name": "Iteration 27"
                }
            ]
        }
    ];
    $scope.params = $routeParams;
}
