define(function(require){

    var $ = require('jquery'),
    syncTemplate = require('text!templates/sync/sync.html'),
    jira = require('jiraModel'),
    tcmModel = require('tcmModel'),
    _ = require('underscore');


    var SyncView = {
        moduleId: "Sync",

        rendered: false,

        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(syncTemplate);

                this.loadIterations();
                this.attachEvents();
                this.rendered = true;
            }
            $('.tcm-top-menu-container a').removeClass('active');
            $('#link-sync').addClass('active').parents('.dropdown').find('a.dropdown-toggle').addClass('active');
            $('.brand').removeClass('active')
        },

        loadIterations: function(){
            jira.iterations.fetch().done(function(data){
                var ddIterations = $('#ddIterations');
                ddIterations.empty()

                _.each(data["sprints"], function (item) {
                    var option = $('<option value="' + item["id"] + '">' + item["name"] + '</option>');
                    ddIterations.append(option);
                });

                ddIterations.chosen();
            } );
        },

        attachEvents: function(){

            //select button
            $("#btnStep1").on('click', function(){
            $('#btnStep1').button('loading');
            $('#issuesContainer').hide();
            $("#alertNoissuesfound").addClass('hide');

            $.when( jira.issues.fetch($("#ddIterations option:selected").val()), tcmModel.releases.features_iterations(0) ).done( function(jiraItems, ftrIters){
                var jirasContainer = $('#jiraItems');
                jirasContainer.empty();
                var alreadyExists = null;
                jiraItems = jiraItems[0];
                ftrIters = ftrIters[0];

                var c = 0;

                _.each(jiraItems, function (item) {

                    var row = $('<tr class="jiraRow"></tr>');

                    var color = ( c & 1 ) ? "#ccc" : "#ddd";

                    row.css("background-color",color);

                    _.each(ftrIters, function(item2, key, list){
                        if(item2.jiraKey == item.key){
                            alreadyExists = ftrIters.splice(key, 1);
                        }
                    });

                    if(alreadyExists){

                        row.css("background-color","beige");

                        row.popover({animation: true,
                            trigger:'hover',
                            placement:'top',
                            title:'Present in Iterations',
                            content: alreadyExists[0].iterations});

                    }

                    row.append( $('<td></td>').append($('<input type="checkbox" name="' + item["key"] + '" value="">')) );
                    row.append( $('<td>'+item["key"]+'</td>') );
                    row.append( $('<td>'+item["summary"]+'</td>') );

                    row.data('jiraIssue', item);

                    jirasContainer.append(row);
                    alreadyExists = null;

                    c++

                });

                adjustSyncHeight();

                $('#jiraItems input[type="checkbox"]').on('click', function(){
                    if($("#jiraItems tr input:checked").size() > 0){
                        $("#btnSync").removeAttr("disabled");
                    }else{
                        $("#btnSync").attr("disabled", "disabled");
                    }
                })

                $('#btnStep1').button('reset');

                if(jiraItems.length > 0){
                    $('#issuesContainer').show();
                }else{
                    $("#alertNoissuesfound").removeClass('hide');
                }
                });

            });

            //select all check box
            $("#allJiras").on("click", function (){
                        if( $("#allJiras").is(':checked')){
                            $("#jiraItems tr input").attr('checked','checked');
                            $("#btnSync").removeAttr("disabled");
                        }else{
                            $("#jiraItems tr input").removeAttr('checked');
                            $("#btnSync").attr("disabled", "disabled");
                        }


                    });

            //modal sync window
            $('#btnSync').on('click', function(){

                    $('btnSync').button('toggle');

                    $('#sync-release-select').releases_iterations_dd();

                    $('#sync-wrapper').modal('show')
                    $('.sync-modal-content').show()


             });

            $("#checkCreateDestination").on('click', function(){
                if( $("#checkCreateDestination").is(':checked')){
                    $("#new-rls-title").removeAttr('disabled');
                    $("#new-iter-title").removeAttr('disabled');
                }else{
                    $("#new-rls-title").attr('disabled','true');
                    $("#new-iter-title").attr('disabled','true');
                }
            });

            $("#syncCancel").on('click', function(e){
                e.stopPropagation();
                $('#sync-wrapper').modal('hide')
                $('btnSync').button('reset');
            });

            $('#syncSave').on('click', function(){

                var iterationId = ""
                var releaseId = ""
                var deferreds = [];

                if($("#checkCreateDestination").is(':checked'))
                {
                    tcmModel.releases.create( $("#new-rls-title").val() ).done(function(data, segundo, tercero){
                        var rlsId = tercero.getResponseHeader('location').toString();
                        rlsId = rlsId.substring(rlsId.lastIndexOf('/') +1 , rlsId.length);
                        if (rlsId == "false"){
                            console.log('Release exists');
                        }else{


                            tcmModel.releases.iterations.create(rlsId, $("#new-iter-title").val() ).done(function(data, segundo, tercero){

                                var iterId = tercero.getResponseHeader('location').toString();
                                iterId = iterId.substring(iterId.lastIndexOf('/') +1 , iterId.length);

                                $("#jiraItems tr input:checked").each(function(){
                                    var issue = $(this).parents('.jiraRow').data('jiraIssue');

                                    deferreds.push( tcmModel.releases.iterations.features.create(0, iterId, issue.key, issue.summary, issue.description) );
                                })

                                $.when.apply($, deferreds).then(syncCompleted);
                            });
                        }

                    });

                }else{

                   iterationId = $('#sync-release-select option:selected').val();
                    releaseId = $('#sync-release-select option:selected').parents('optgroup').attr('rel-id');

                   if(iterationId !=""){

                       $("#jiraItems tr input:checked").each(function(){
                           var issue = $(this).parents('.jiraRow').data('jiraIssue');

                           deferreds.push(tcmModel.releases.iterations.features.create(releaseId, iterationId, issue.key, issue.summary, issue.description));
                       });

                       $.when.apply($, deferreds).then(syncCompleted);

                   }else{
                       //alert("TODO: select");
                   }
                }



            });

            $("#alertCompleted-Sync .btn").on('click', function(){

                $('#sync-wrapper').modal('hide')
                window.location.href = '#/viewer';
            });

        }
    };

    function syncCompleted(){
        $('btnSync').button('reset');
        $('#jiraItems').empty();
        $('.sync-modal-content').hide()
        //$("#alertCompleted-Sync").alert();
        $("#alertCompleted-Sync").show();
    }

    function adjustSyncHeight(){

        try{
            $('#tcSync').css('height',(($('.tcm-container').height() - 30)*100)/$('.tcm-container').height()+'%')

            var parentHeight = $('.tcm-container').height()
            var metrics_controls = 210;
            var newHeight = parentHeight - metrics_controls;
            $('#tcSync #jiras-wrapper').css('height', newHeight)

        }catch(err){}
    }

    $(window).resize(adjustSyncHeight);

    return SyncView;

});