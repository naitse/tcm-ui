define(function(require){
    //var basePath = "http://tcm-backend-qa.cloudhub.io";
    var basePath = "http://tcm-backend.cloudhub.io";
    //var basePath = "http://localhost:8088";

	var $ = require('jquery');
	
    $.ajaxSetup({
        cache: false,
        beforeSend: function(xhr) {
            var params = {
                apiKey: $.cookie("apiKey"),
                projectId: $.cookie("projectId")
            }

            if(this.url.indexOf('?') > -1){
                this.url += '&' + $.param(params);
            }else{
                this.url += '?' + $.param(params);
            }

        },
        statusCode: {
            401: function(){
                var wl = window.location;
                wl.href = wl.protocol + '//' + wl.hostname + wl.pathname + 'login.html'
            }
        }
    });

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
