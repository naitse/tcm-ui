
define( function(){
    var basePath = "http://tcm-backend.cloudhub.io/api/";
    //var basePath = "http://tcm-backend-qa.cloudhub.io/api/";
    //var basePath = "http://localhost:8088/api/";
    var basePath2 = basePath.replace('api/','');

    $.ajaxSetup(

        {beforeSend: function(xhr) {
            if(this.url.indexOf('?') > -1){
                this.url = this.url + "&apiKey=" + $.cookie("apiKey") + "&projectId=" + $.cookie("projectId");
            }else{
                this.url = this.url + "?apiKey=" + $.cookie("apiKey") + "&projectId=" + $.cookie("projectId");
            }

        }
    });

    var tcm_model = {

        login: function(username, password){

                return $.ajax({
                    type: "GET",
                    beforeSend: function(xhrObj){
                        // console.log(username, password, $.base64.encode(username +':'+password));
                        xhrObj.setRequestHeader("Authorization", "Basic " + $.base64.encode(username + ':' + password));
                     },
                    url: basePath + 'get_api_key',
                    dataType: "json"
                });

        },

        users: {
            projects:{
                url: basePath + 'users/{userName}/projects',

                fetch: function (username) {
                    return $.ajax({
                        type: "GET",
                        url: this.url.replace("{userName}", username),
                        dataType: "json"
                    });
                }
            }
        },

        releases: {
            url: basePath + 'releases',

            fetch: function () {
                    return $.ajax({
                        type: "GET",
                        url: this.url,
                        dataType: "json"
                    });
            },

            features_iterations: function(releaseId){
                var urlplan  = basePath +'releases/{rlsId}/features_iterations'

                return $.ajax({
                    type: "GET",
                    cache:false,
                    url: urlplan.replace('{rlsId}', releaseId),
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
            metrics_iter_trend: function(releaseId){
                var urlplan  = basePath +'releases/{rlsId}/metricgetIterationsTrend'


                return $.ajax({
                    type: "GET",
                    cache:false,
                    url: urlplan.replace('{rlsId}', releaseId),
                    dataType: "json"
                });

            },
            iterations: {
                url: basePath + 'releases/{rlsId}/iterations',

                create: function(rlsid, iterName){
                    var data ={
                        "name":iterName
                    };

                    return $.ajax({
                        type: "POST",
                        url: this.url.replace("{rlsId}", rlsid),
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

                metrics_dailyexecuted: function(releaseId, iterationid){
                    var urlplan =basePath +'releases/{rlsId}/iterations/{iterId}/metricDailyExecution'


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
                    closeurl: basePath2 +'closeJira',

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

                    close: function (featureId, jiraKey) {

                            return $.ajax({
                                type: "GET",
                                cache:false,
                                url:  this.closeurl + '?featureId='+featureId+'&issueKey='+jiraKey,
                                dataType: "json"
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
                        },

                        suites:{
                            fetch:function(tcId){
                                return   $.ajax({
                                      type:'GET',
                                      cache:false,
                                      url: basePath2 + "getSuitesforTc?tcId="+tcId,
                                      dataType: "json"
                                });
                            },
                            remove:function(tcId,label){
                                return   $.ajax({
                                      type:'DELETE',
                                      cache:false,
                                      url: basePath2 + "removeSuitesforTc?tcId="+tcId+"&label="+label,
                                      dataType: "json"
                                });
                            },
                            add:function(tcId,label,pId){
                                return   $.ajax({
                                      type:'POST',
                                      cache:false,
                                      url: basePath2 + "insertSuitesforTc?tcId="+tcId+"&label="+label,
                                      dataType: "json"
                                });
                            },
                            source:function(projectId){
                                return $.ajax({
                                    type:'POST',
                                    url: basePath2 + "getSuites",
                                    dataType: "json"
                                  });
                            },

                            getTcsForStuitesByProject: function(label){
                                return $.ajax({
                                    type:'GET',
                                    url: basePath2 + "getTcsForStuitesByProject" + "?label=" + label,
                                    dataType: "json"
                                  });
                            }
                        }
                    }
                }
            }
        }
    };

    return tcm_model;
});