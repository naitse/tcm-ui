var  basePath =  "http://tcm-backend-qa.cloudhub.io/";


tcmModule.factory('Auth', function($http, $cookieStore){

    var accessLevels = routingConfig.accessLevels
        , userRoles = routingConfig.userRoles
        , currentUser = $cookieStore.get('user') || { username: '', role: userRoles.public };

    $cookieStore.remove('user');

    function changeUser(user) {
        _.extend(currentUser, user);
    };

    return {
        authorize: function(accessLevel, role) {
            if(role === undefined)
                role = currentUser.role;
            return accessLevel.bitMask & role.bitMask;
        },
        isLoggedIn: function(user) {
            if(user === undefined)
                user = currentUser;
            return user.role.title == userRoles.user.title || user.role.title == userRoles.admin.title;
        },
        login: function(user, success, error) {

            $http.defaults.headers.common['Authorization'] = "Basic " + $.base64.encode(user.username + ':' + user.password);

            $http.get(basePath + 'api/get_api_key').success(function(data){
                user.apiKey = data.apiKey;
                changeUser(user);
                success(user);

           }).error(error);
        },
        logout: function(success) {

            changeUser({
                username: '',
                role: userRoles.public
            });
            success();

        },
        accessLevels: accessLevels,
        userRoles: userRoles,
        user: currentUser
    };
});

tcmModule.factory('tcm_model', ['$http', '$routeParams', 'Auth', function($http, $routeParams, Auth) {

        return {

            getProjects: function(success, error){
                $http.get( basePath + 'api/users/' + Auth.user.username + '/projects?apiKey=' + Auth.user.apiKey).success(success).error(error);
            },
            getReleases: function(success, error) {
                $http.get( basePath + 'api/releases_iterations?apiKey='+Auth.user.apiKey+'&projectId='+$routeParams.projectId ).success(success).error(error);
            },
            getFeatures: function(release, iteration, success, error){
                $http.get( basePath + 'api/releases/'+release.id+'/iterations/'+iteration.id+'/features?apiKey='+Auth.user.apiKey+'&projectId='+$routeParams.projectId).success(success).error(error);
            },
            getTestCases: function(featureid, success, error){
                $http.get( basePath + 'api/releases/1/iterations/0/features/'+featureid+'/testcases?apiKey='+Auth.user.apiKey+'&projectId='+$routeParams.projectId).success(success).error(error);
            },
            getExecutedTestCases: function(featureId, success, error){
                $http.get( basePath + 'api/releases/0/iterations/0/features/' + featureId + '/executedtestcases?apiKey='+Auth.user.apiKey+'&projectId='+$routeParams.projectId).success(success).error(error);
            },

           getProjectConfiguration: function(success, error){
               $http.get( basePath + 'getProjectConfig?apiKey='+Auth.user.apiKey+'&projectId='+$routeParams.projectId).success(success).error(error);
           },
           updateTCStatus: function(tc, newStatus, success, error){
               $http.put( basePath + 'api/releases/1/iterations/0/features/0/testcases/' + tc.tcId + '/status?apiKey='+Auth.user.apiKey+'&projectId='+$routeParams.projectId, newStatus).success(success).error(error);

           }

        };
    }]);