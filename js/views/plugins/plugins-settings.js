define(function(require){

    var $ = require('jquery'),
        settingsTemplate = require('text!templates/plugins/plugins-settings.html'),
        tcmModel = require('tcmModel'),
        _ = require('underscore'),
        grid = require('jquery.grid');

    var PluginsSettingsView = {
        moduleId: "plugins-settings",

        divContainer:  $("#plugin-settings"),

        rendered: false,

        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(settingsTemplate);

                this.loadPlugins()

                this.attachEvents();
                this.rendered = true;
            }

        },


        loadPlugins: function(){
            tcmModel.plugins.fetch().done(function(data){

                _.each(data, function(p){
                    if( p.name == "Jira"){

                        $("#pluginEnabled-jira").prop("checked",p["properties"]["enabled"]);

                        _.each(p["properties"], function(value, key){

                            $("#" + key.replace(".", "")).val(value);

                            if(p["properties"]["enabled"]){
                                $("#" + key.replace(".", "")).removeAttr('disabled');
                            }else{
                                $("#" + key.replace(".", "")).attr('disabled', 'disabled');
                            }
                        });
                    }
                });
            });

        },

        attachEvents: function(){

            $("#pluginEnabled-jira").on('click', function(){
                if(this.checked){
                    $('#jirauser').removeAttr('disabled');
                    $('#jirapassword').removeAttr('disabled');
                    $('#jiraproject').removeAttr('disabled');
                    $('#jiraaddress').removeAttr('disabled');
                    $('#jiragreenhopper').removeAttr('disabled');
                }else{
                    $('#jirauser').attr('disabled', 'disabled');
                    $('#jirapassword').attr('disabled', 'disabled');;
                    $('#jiraproject').attr('disabled', 'disabled');
                    $('#jiraaddress').attr('disabled', 'disabled');
                    $('#jiragreenhopper').attr('disabled', 'disabled');
                }
            });


            $("#save-jira").on('click', function(){

                var pluginData = {
                    "id": 2,
                    "properties": {
                        "enabled": $("#pluginEnabled-jira").prop('checked'),
                        "jira.user": $('#jirauser').val(),
                        "jira.project": $('#jiraproject').val(),
                        "jira.greenhopper": $('#jiragreenhopper').val(),
                        "jira.password": $('#jirapassword').val(),
                        "jira.address": $('#jiraaddress').val()
                    }
                }


              tcmModel.plugins.save(pluginData).done(function(){
                  console.log('saved');
              });
            })
        }
    };



    return PluginsSettingsView;

});