
define( function(require){
    //var basePath = "http://tcm-backend.cloudhub.io/api/";
    //var basePath = "http://tcm-backend-qa.cloudhub.io/api/";
    //var basePath = "http://54.226.164.226/api/";
    var basePath = "http://localhost:8088/api/";
    var basePath2 = basePath.replace('api/','');
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
                if(!window.location.href.indexOf('login.html')){
                    var wl = window.location;
                    wl.href = wl.protocol + '//' + wl.hostname + wl.pathname + 'login.html'
                }
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

        project: {
            configuration:{

                fetch:function(){
                    return   $.ajax({
                          type:'GET',
                          url: basePath2 + "getProjectConfig",
                          dataType: "json"
                    });
                },
                add:function(req){
                    return   $.ajax({
                        type:'POST',
                        url: basePath2 + "saveProjectConfig",
                        data:JSON.stringify(req),
                        contentType: "application/json",
                        dataType: "json"
                    });
                }
            }
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

        suites:{

            add:function(label,pId){
                return   $.ajax({
                      type:'POST',
                      
                      url: basePath2 + "addSuite?label="+label,
                      dataType: "json"
                });
            },
            remove:function(id){
                return   $.ajax({
                      type:'POST',
                      
                      url: basePath2 + "removeSuite?suiteId="+id,
                      dataType: "json"
                });
            },
            source:function(interop){
                var interParam = '?interop=0';
                if (interop  == 1){
                    interParam = '?interop=1'
                }
                return $.ajax({
                    type:'POST',
                    url: basePath2 + "getSuites" + interParam,
                    dataType: "json"
                  });
            },
           instance:function(iterId,suiteId){

                req = {
                    iterationId:iterId,
                    suiteId:suiteId
                }

                return   $.ajax({
                    type:'POST',
                    url: basePath2 + "instanceSuite",
                    data:JSON.stringify(req),
                    contentType: "application/json",
                    dataType: "json"
                });
            },

            testcases:{

                fetch: function(label){

                    return $.ajax({
                        type:'GET',
                        url: basePath2 + "getTcsForStuitesByProject?label=" + label,
                        dataType: "json"
                    });
                },

                add: function (suiteId, req) {
                    
                    var params = {
                        suiteId:suiteId
                    }

                    return $.ajax({
                        type: "POST",
                        url: basePath2 + "createTestCaseForSuite?" + $.param(params),
                        data:JSON.stringify(req),
                        contentType: "application/json",
                        dataType: "json"
                    });
                },
                del: function (tcId) {
                    return $.ajax({
                        type: "DELETE",
                        url: basePath2 + "deleteTestCaseSuite?tcId=" + tcId,
                        contentType: "application/json",
                        dataType: "json"
                    });
                }

            }

        },
        releases_iterations: {
            url: basePath + 'releases_iterations',

            fetch: function () {
                    return $.ajax({
                        type: "GET",
                        url: this.url,
                        dataType: "json"
                    });
            }
        },
        ris:{
            url: basePath2 + 'ris?iterationId=',

            fetch: function (iterId) {
                    return $.ajax({
                        type: "GET",
                        url: this.url + iterId,
                        dataType: "json"
                    });
            }
        },
        metrics:{
                url: basePath2 + 'getFBTCS?iterationId=',
            getFBTCS:function(iterId){

                return $.ajax({
                    type: "GET",
                    url: this.url + iterId,
                    dataType: "json"
                });
            }
        },
        testcases:{
            clone:function(req){
                url = basePath2 + 'releases_iterations'

                return $.ajax({
                        type: "POST",
                        url: basePath2 + "cloneTcs",
                        data:JSON.stringify(req),
                        contentType: "application/json",
                        dataType: "json"
                });

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
                    url: urlplan.replace('{rlsId}', releaseId),
                    dataType: "json"
                });
            },

            create: function(rlsName,rstart,rend) {

                var data ={
                    "name":rlsName,
                    "start":rstart,
                    "end":rend
                };

                return $.ajax({
                    type: "POST",
                    url: this.url,
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType : 'application/json'
                });
            },

            remove: function(rlsid) {

                return $.ajax({
                    type: "POST",
                    url: basePath2 + 'deleteRelease?releaseId=' + rlsid,
                    dataType: "json",
                });
            },
            metrics_iter_trend: function(releaseId){
                var urlplan  = basePath +'releases/{rlsId}/metricgetIterationsTrend'


                return $.ajax({
                    type: "GET",
                    url: urlplan.replace('{rlsId}', releaseId),
                    dataType: "json"
                });

            },

            metrics_carried_over: function(releaseId){
                var urlplan  = basePath +'releases/{rlsId}/metricGetCarriedOverFeatures'


                return $.ajax({
                    type: "GET",
                    url: urlplan.replace('{rlsId}', releaseId),
                    dataType: "json"
                });

            },

            iterations: {
                url: basePath + 'releases/{rlsId}/iterations',

                remove: function(iterId) {

                    return $.ajax({
                        type: "POST",
                        url: basePath2 + 'deleteIteration?iterationId=' + iterId,
                        dataType: "json",
                    });
                },

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
                        url: urlplan.replace('{rlsId}', releaseId).replace('{iterId}', iterationid),
                        dataType: "json"
                    });

                },

                metrics_executed: function(releaseId, iterationid){
                    var urlplan =basePath +'releases/{rlsId}/iterations/{iterId}/metricExecuted'


                    return $.ajax({
                        type: "GET",
                        url: urlplan.replace('{rlsId}', releaseId).replace('{iterId}', iterationid),
                        dataType: "json"
                    });

                },

                metrics_dailyexecuted: function(releaseId, iterationid){
                    var urlplan =basePath +'releases/{rlsId}/iterations/{iterId}/metricDailyExecution'


                    return $.ajax({
                        type: "GET",
                        
                        url: urlplan.replace('{rlsId}', releaseId).replace('{iterId}', iterationid),
                        dataType: "json"
                    });

                },

                monitoringExecutedTestCases:{

                    url: basePath2 +'monitoringETC',

                    fetch: function (releaseId, iterationid, data) {
                        return $.ajax({
                            type: "POST",
                            
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
                    deleteurl: basePath2 +'deleteFeature',

                    fetch: function (releaseId, iterationid) {
                        return $.ajax({
                            type: "GET",
                            
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

                    _create: function(releaseId, iterationid, key, summary, desc ){
                        var data ={
                            "key":key,
                            "summary":summary,
                            "desc":desc
                        };

                        return $.ajax({
                            type: "POST",
                            url: this.url.replace('{rlsId}', releaseId).replace('{iterId}', iterationid),
                            data: JSON.stringify(data),
                            dataType: "json",
                            contentType : 'application/json'
                        });

                    },

                    delete: function(featureId ){

                            return $.ajax({
                                type: "GET",
                                url:  this.deleteurl + '?featureId='+featureId,
                                dataType: "json"
                            });

                    },

                    close: function (featureId, jiraKey) {

                            return $.ajax({
                                type: "GET",
                                
                                url:  this.closeurl + '?featureId='+featureId+'&issueKey='+jiraKey,
                                dataType: "json"
                            });
                    },

                    executedTestCases:{
                        url: basePath +'releases/{rlsId}/iterations/{iterId}/features/{ftrId}/executedtestcases',

                        fetch: function (releaseId, iterationid, featureId) {
                            return $.ajax({
                                type: "GET",
                                
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
                                
                                url: this.url.get.replace('{rlsId}', releaseId).replace('{iterId}', iterationid).replace('{ftrId}',featureId),
                                dataType: "json"
                            });
                        },
                        add: function (releaseId, iterationid, featureId, req) {
                            return $.ajax({
                                type: "POST",
                                
                                url: this.url.add.replace('{rlsId}', releaseId).replace('{iterId}', iterationid).replace('{ftrId}',featureId),
                                data:JSON.stringify(req),
                                contentType: "application/json",
                                dataType: "json"
                            });
                        },
                        del: function (releaseId, iterationid, featureId,tcId) {
                            return $.ajax({
                                type: "DELETE",
                                
                                url: this.url.del.replace('{rlsId}', releaseId).replace('{iterId}', iterationid).replace('{ftrId}',featureId).replace('{tstId}',tcId),
                                contentType: "application/json",
                                dataType: "json"
                            });
                        },
                        status:{
                            url:basePath +'releases/{rlsId}/iterations/{iterId}/features/{ftrId}/testcases/{tstId}/status',
                            updateStatus: function (releaseId, iterationid, featureId, tcId, statusId,actualResult) {
                                
                                var newStatus={
                                   'statusId':statusId,
                                   'actualResult':actualResult
                                };

                                return $.ajax({
                                    type: "PUT",
                                    
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
                                      
                                      url: basePath2 + "getSuitesforTc?tcId="+tcId,
                                      dataType: "json"
                                });
                            },
                            remove:function(tcId,label){
                                return   $.ajax({
                                      type:'DELETE',
                                      
                                      url: basePath2 + "removeSuitesforTc?tcId="+tcId+"&label="+label,
                                      dataType: "json"
                                });
                            },
                            add:function(tcId,label,pId){
                                return   $.ajax({
                                      type:'POST',
                                      
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

                                var params = {
                                    label:label
                                }

                                return $.ajax({
                                    type:'GET',
                                    url: basePath2 + "getTcsForStuitesByProject?" + $.param(params),
                                    dataType: "json"
                                });
                            }
                        }
                    }
                }
            }
        },
        plugins: {

            fetch:function(){
                return   $.ajax({
                    type:'GET',
                    url: basePath + "plugins",
                    dataType: "json"
                });
            },
            save:function(pluginData){
                return   $.ajax({
                    type:'PUT',
                    url: basePath + "plugins/" + pluginData.id,
                    data:JSON.stringify(pluginData),
                    contentType: "application/json",
                    dataType: "json"
                });
            }

        }
    };

    return tcm_model;
});