define(function(require){

    var $ = require('jquery'),
        planTemplate = require('text!templates/metrics/metrics.html'),
        tcmModel = require('tcmModel'),
        _ = require('underscore');

    require('raphael');
    require('graphael');
    require('pie_min');


    var MetricsView = {
        moduleId: "Metrics",

        rendered: false,

        render: function(){
            if(!this.rendered){
                $("#pannel-wrapper").append(planTemplate);

                this.loadIterations();
                this.attachEvents();
                this.rendered = true;
            }
        },

        loadIterations: function(){

            tcmModel.releases.fetch().done(function(data){

                $('#metrics-release-select').find('optgroup').remove();

                $(data).each(function(){
                    var optionG = $('<optgroup>').attr('label', "Release "+this.name).attr('rel-id',this.id)
                    $(this.iterations).each(function(){
                        var option = $('<option>').attr('value', this.id).text( this.name);
                        $(optionG).append(option);
                    });
                    $('#metrics-release-select').append(optionG)
                });
            });

            //$('#metrics-release-select').chosen();

        },

        attachEvents: function(){
            var btnGetMetrics = $('#btnGetMetrics');

            btnGetMetrics.on('click', function(){
                var iterId =  $("#metrics-release-select option:selected").val();
                var rlsId =  $("#metrics-release-select option:selected").parents('optgroup').attr('rel-id');

                btnGetMetrics.button('loading');
                $("#alertNoMetrics").addClass('hide');
                $("#metricsContainer").hide();

                $("#metricsProgressBar").show();
                $("#metricsProgressBar").find(".bar").css("width","10%");

                $.when( tcmModel.releases.iterations.metrics_executed(rlsId, iterId)).done(function( metrics ){
                    var r = window.Raphael(10, 50, 640, 480);

                    r.piechart(320, 240, 100, [55, 20, 13, 32, 5, 1, 2]);
                });



                $("#metricsProgressBar").hide()

            });
        }

    };

    return MetricsView;

});