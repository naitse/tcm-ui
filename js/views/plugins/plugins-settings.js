define(function(require){

    var $ = require('jquery'),
        settingsTemplate = require('text!templates/plugins/plugins-settings.html'),
        tcmModel = require('tcmModel'),
        _ = require('underscore'),
        grid = require('jquery.grid');

    var PluginsSettingsView = {
        moduleId: "plugins-settings",

        rendered: false,

        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(settingsTemplate);

                var container = $("#plugin-props-table");

                container.handsontable({
                    startRows: 15,
                    startCols: 16,
                    colHeaders: ["property", "value"],
                    rowHeaders: false,
                    //minSpareCols: 1,
                    minSpareRows: 1,
                    contextMenu: true,
                    RemoveRow: true,
                    colWidths: [200, 700]
                });

                var data = [

                    ["2008", 10],
                    ["2009", 20],
                    ["2010", 30]
                ];

                container.handsontable("loadData", data);

                $("#plugin-props-table table").addClass('table');

                $("button#selectFirst").on('click', function () {
                    setTimeout(function () {
                        //timeout is needed because Handsontable normally deselects
                        //current cell when you click outside the table
                        container.handsontable("selectCell", 0, 0);
                    }, 10);
                });

               /* $("input#rowHeaders").change(function () {
                    container.handsontable("updateSettings", {rowHeaders: $(this).is(':checked')});
                });

                $("input#colHeaders").change(function () {
                    container.handsontable("updateSettings", {colHeaders: $(this).is(':checked')});
                });*/

                this.attachEvents();
                this.rendered = true;
            }

        },

        attachEvents: function(){

        }
    };



    return PluginsSettingsView;

});