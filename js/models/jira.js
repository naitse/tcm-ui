define(function(require){
    var basePath = "http://localhost:8088";

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
