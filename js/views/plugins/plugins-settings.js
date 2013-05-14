define(function(require){

    var $ = require('jquery'),
        settingsTemplate = require('text!templates/plugins/plugins-settings.html'),
        tcmModel = require('tcmModel'),
        _ = require('underscore');


    var PluginsSettingsView = {
        moduleId: "plugins-settings",

        rendered: false,

        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(settingsTemplate);

                this.attachEvents();
                this.rendered = true;
            }

        },

        attachEvents: function(){

        }
    };



    return PluginsSettingsView;

});