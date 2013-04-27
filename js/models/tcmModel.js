define(function(require){
    var basePath = "http://tcm-backend.cloudhub.io/api/";

    var tcm_model = {

        releases: {
            url: basePath + 'releases_iterations',

            fetch: function () {
                    return $.ajax({
                        type: "GET",
                        url: this.url,
                        dataType: "json"
                    });
            }
        },

        features: {
            url: basePath +'features?itId=',

            fetch: function (iterationid) {
                return $.ajax({
                    type: "GET",
                    cache:false,
                    url: this.url + iterationid,
                    dataType: "json"
                });
            }
        },

        test_cases: {
            url: {
                get:basePath +'testcases?ftId=',
                add:basePath +'testcases',
                del:basePath +'testcases/',
                update:basePath +'testcases/'
            },

            fetch: function (feature_id) {
                return $.ajax({
                    type: "GET",
                    cache:false,
                    url: this.url.get + feature_id,
                    dataType: "json"
                });
            },
            add: function (req) {
                return $.ajax({
                    type: "POST",
                    cache:false,
                    url: this.url.add,
                    data:JSON.stringify(req),
                    contentType: "application/json",
                    dataType: "json"
                });
            },
            del: function (tcId) {
                return $.ajax({
                    type: "DELETE",
                    cache:false,
                    url: this.url.del + tcId,
                    contentType: "application/json",
                    dataType: "json"
                });
            },
            updateStatus: function (tcId, statusId) {
                return $.ajax({
                    type: "PUT",
                    cache:false,
                    url: this.url.update + tcId +'/status/' + statusId,
                    contentType: "application/json",
                    dataType: "json"
                });
            },
            update: function (tcObject) {
                console.log(JSON.stringify(tcObject))
                return $.ajax({
                    type: "PUT",
                    cache:false,
                    url: this.url.update + tcObject.tcId,
                    data:JSON.stringify(tcObject),
                    contentType: "application/json",
                    dataType: "json"
                });
            }

        },

        feature_teststats:{
            url: basePath +'features/executedtestcases?ftId=',

            fetch: function (feature_id) {
                return $.ajax({
                    type: "GET",
                    cache:false,
                    url: this.url + feature_id,
                    dataType: "json"
                });
            }
        }
    };

    return tcm_model;
});