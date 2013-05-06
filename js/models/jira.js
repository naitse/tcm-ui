define(function(require){
    //var basePath = "http://tcm-backend-qa.cloudhub.io";
    var basePath = "http://tcm-backend.cloudhub.io";

    var jira = {

        iterations: {
            path: '/api/jira/iterations',

            fetch: function() {
                return $.getJSON(basePath + this.path);
            }
        },

        issues:{
            path: '/api/jira/issues',

            fetch: function(iterId) {
                return $.getJSON(basePath + this.path + '?sprint=' + iterId);
            }
        }
    };

    return jira;
});
