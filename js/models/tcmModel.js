define(function(){
    var basePath = "http://tcm-backend.cloudhub.io/api/";
    //var basePath = "http://localhost:8081/api/";
    var basePath2 = basePath.replace('api/','');

    var tcm_model = {

        releases: {
            url: basePath + 'releases',

            fetch: function () {
                    return $.ajax({
                        type: "GET",
                        url: this.url,
                        dataType: "json"
                    });
            },

            create: function(rlsName) {
                var data ={
                    "name":rlsName
                };

                return $.ajax({
                    type: "POST",
                    url: this.url,
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType : 'application/json'
                });
            },

            iterations: {
                url: basePath + 'releases/{rlsId}/iterations',

                create: function(rlsName, iterName){
                    var data ={
                        "name":iterName
                    };

                    return $.ajax({
                        type: "POST",
                        url: this.url.replace("{rlsId}", rlsName),
                        data: JSON.stringify(data),
                        dataType: "json",
                        contentType : 'application/json'
                    });
                },

                plan: function(releaseId, iterationid){
                    var urlplan =basePath +'releases/{rlsId}/iterations/{iterId}/plan'


                    return $.ajax({
                        type: "GET",
                        cache:false,
                        url: urlplan.replace('{rlsId}', releaseId).replace('{iterId}', iterationid),
                        dataType: "json"
                    });

                },

                metrics_executed: function(releaseId, iterationid){
                    var urlplan =basePath +'releases/{rlsId}/iterations/{iterId}/metricExecuted'


                    return $.ajax({
                        type: "GET",
                        cache:false,
                        url: urlplan.replace('{rlsId}', releaseId).replace('{iterId}', iterationid),
                        dataType: "json"
                    });

                },

                monitoringExecutedTestCases:{

                    url: basePath2 +'monitoringETC',

                    fetch: function (releaseId, iterationid, data) {
                        return $.ajax({
                            type: "POST",
                            cache:false,
                            data: JSON.stringify(data),
                            url:  this.url,
                            dataType: "json",
                            contentType : 'application/json'
                        });
                    }
                },

                features: {
                    url: basePath +'releases/{rlsId}/iterations/{iterId}/features',

                    fetch: function (releaseId, iterationid) {
                        return $.ajax({
                            type: "GET",
                            cache:false,
                            url: this.url.replace('{rlsId}', releaseId).replace('{iterId}', iterationid),
                            dataType: "json"
                        });
                    },

                    create: function(releaseId, iterationid, key, summary, desc ){
                        var data ={
                            "key":key,
                            "summary":summary,
                            "desc":desc
                        };

                        $.ajax({
                            type: "POST",
                            url: this.url.replace('{rlsId}', releaseId).replace('{iterId}', iterationid),
                            data: JSON.stringify(data),
                            dataType: "json",
                            contentType : 'application/json'
                        });

                    },

                    executedTestCases:{
                        url: basePath +'releases/{rlsId}/iterations/{iterId}/features/{ftrId}/executedtestcases',

                        fetch: function (releaseId, iterationid, featureId) {
                            return $.ajax({
                                type: "GET",
                                cache:false,
                                url:  this.url.replace('{rlsId}', releaseId).replace('{iterId}', iterationid).replace('{ftrId}',featureId),
                                dataType: "json"
                            });
                        }
                    },

                    test_cases: {
                        url: {
                            get:basePath +'releases/{rlsId}/iterations/{iterId}/features/{ftrId}/testcases',
                            add:basePath +'releases/{rlsId}/iterations/{iterId}/features/{ftrId}/testcases',
                            del:basePath +'releases/{rlsId}/iterations/{iterId}/features/{ftrId}/testcases/{tstId}',
                            update:basePath +'releases/{rlsId}/iterations/{iterId}/features/{ftrId}/testcases/{tstId}'
                        },

                        fetch: function (releaseId, iterationid, featureId) {
                            return $.ajax({
                                type: "GET",
                                cache:false,
                                url: this.url.get.replace('{rlsId}', releaseId).replace('{iterId}', iterationid).replace('{ftrId}',featureId),
                                dataType: "json"
                            });
                        },
                        add: function (releaseId, iterationid, featureId, req) {
                            return $.ajax({
                                type: "POST",
                                cache:false,
                                url: this.url.add.replace('{rlsId}', releaseId).replace('{iterId}', iterationid).replace('{ftrId}',featureId),
                                data:JSON.stringify(req),
                                contentType: "application/json",
                                dataType: "json"
                            });
                        },
                        del: function (releaseId, iterationid, featureId,tcId) {
                            return $.ajax({
                                type: "DELETE",
                                cache:false,
                                url: this.url.del.replace('{rlsId}', releaseId).replace('{iterId}', iterationid).replace('{ftrId}',featureId).replace('{tstId}',tcId),
                                contentType: "application/json",
                                dataType: "json"
                            });
                        },
                        status:{
                            url:basePath +'releases/{rlsId}/iterations/{iterId}/features/{ftrId}/testcases/{tstId}/status',
                            updateStatus: function (releaseId, iterationid, featureId, tcId, statusId) {
                                var newStatus={
                                   'statusId':statusId
                                };

                                return $.ajax({
                                    type: "PUT",
                                    cache:false,
                                    data:JSON.stringify(newStatus),
                                    url: this.url.replace('{rlsId}', releaseId).replace('{iterId}', iterationid).replace('{ftrId}',featureId).replace('{tstId}',tcId),
                                    contentType: "application/json",
                                    dataType: "json"
                                });
                            }
                        },
                        update: function (releaseId, iterationid, featureId,tcObject) {
                            return $.ajax({
                                type: "PUT",
                                cache:false,
                                data:JSON.stringify(tcObject),
                                url: this.url.update.replace('{rlsId}', releaseId).replace('{iterId}', iterationid).replace('{ftrId}',featureId).replace('{tstId}',tcObject.tcId),
                                contentType: "application/json",
                                dataType: "json"
                            });
                        }

                    }
                }
            }
        }
    };

    return tcm_model;
});