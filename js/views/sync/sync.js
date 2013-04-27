define(function(require){

    var $ = require('jquery'),
    syncTemplate = require('text!templates/sync/sync.html'),
    jira = require('jiraModel'),
    _ = require('underscore');


    var SyncView = {
        render: function(){

            $("#pannel-wrapper").append(syncTemplate);
            this.loadIterations();
            this.attachEvents();
        },

        loadIterations: function(){
            jira.iterations.fetch().done(function(data){
                var ddIterations = $('#ddIterations');
                ddIterations.empty()

                _.each(data["sprints"], function (item) {
                    var option = $('<option value="' + item["id"] + '">' + item["name"] + '</option>');
                    ddIterations.append(option);
                });
            } );
        },

        attachEvents: function(){
            $("#btnStep1").on('click', function(){

                $.when( jira.issues.fetch($("#ddIterations option:selected").val()) ).done( function(jiraItems){
                        var jirasContainer = $('#jiraItems');
                        jirasContainer.empty();

                        _.each(jiraItems, function (item) {

                            var row = $('<tr class="jiraRow"></tr>');

                            row.append( $('<td><input type="checkbox" name="'+item["key"]+'" value=""></td>') );
                            row.append( $('<td>'+item["key"]+'</td>') );
                            row.append( $('<td>'+item["summary"]+'</td>') );

                            row.data('jiraIssue', item);

                            jirasContainer.append(row);
                        });
                    });

            });
        }
    };

    return SyncView;

});