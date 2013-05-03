define(function(require){

    var $ = require('jquery'),
        planTemplate = require('text!templates/metrics/metrics.html'),
        tcmModel = require('tcmModel'),
        _ = require('underscore');

    require('highcharts');
    require('exporting');

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
                console.log('teta')

                $.when( tcmModel.releases.iterations.metrics_executed(rlsId, iterId)).done(function( metrics ){
                    if(metrics.length > 0){
                        var chartData = new Array();

                        _.each(metrics[0], function(value, key, list){


                            chartData.push([ key, value]);

                        });

                        $('#executionContainer').data('data',chartData);

                        renderExecutionPie(chartData);
                    }

                });

                $("#metricsProgressBar").find(".bar").css("width","50%");

                $.when( tcmModel.releases.iterations.metrics_dailyexecuted(rlsId, iterId)).done(function( metrics ){
                    if(metrics.length > 0){
                        var days = new Array();
                        var testcases = new Array();


                        _.each(metrics, function(value, key, list){
                            days.push(value.day);
                            testcases.push(value.testcases);
                        });

                        $('#dailyExecutionContainer').data('data',[days,testcases]);
                        // $('#dailyExecutionContainer').data('testcases',testcases);

                        renderDailyExec();
                    }

                });

                $('.carousel').each(function(){
                    $(this).carousel({
                        interval: false
                    });
                });

                $("#metricsProgressBar").hide();
                btnGetMetrics.button('reset');
                $("#metricsContainer").show();
            });
        }

    };

    function renderExecutionPie(data){

        var data = $('#executionContainer').data('data');
        var $this = $('#executionContainer');
        
        $('#executionContainer').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                margin: [40, 0, 0, 0],
                events: {
                    click: function(event) {
                        toggleChartFocus($this);
                    }
                }    
            },
            title: {
                text: 'Test plan execution'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        color: '#000000',
                        connectorColor: '#000000',
                        formatter: function() {
                            return '<b>'+ this.point.name +'</b>: '+ Math.round(this.percentage) +' %';
                        }
                    }
                }
            },
            series: [{
                type: 'pie',
                name: 'Test Cases',
                data: data
            }]
        });
        
        adjustChartHeight()

    }

    function renderDailyExec(days, tcs){

        var $this = $('#dailyExecutionContainer');
        var days = $this.data('data')[0];
        var tcs = $this.data('data')[1];

        $('#dailyExecutionContainer').highcharts({
            chart: {
                events: {
                    click: function(event) {
                        toggleChartFocus($this);
                    }
                }      
            },
             title: {
                text: 'Daily Execution',
                x: -20 //center
            },
            xAxis: {
                categories: days,
                title: {
                    text: 'Days'
                }
            },
            yAxis: {
                title: {
                    text: 'Test Cases'
                }
            },
            series: [{
                showInLegend: false,
                data: tcs
            }]
        });
    }

    function toggleChartFocus(chartDiv){

        var main_graph = $('.graph-container').find('#container');
        var current_graph = $('.graph-container').find('#container').children();
        var preview_graph = $('.graph-previews').find(chartDiv);

        if( $('.graph-previews').find(chartDiv).size() == 1 ){
            current_graph.html('').hide();
            preview_graph.html('').hide;
            $('.graph-previews').append(current_graph);
            main_graph.append(preview_graph)
            $('.graph-previews').children().show();
            main_graph.children().show;
            renderDailyExec();
            renderExecutionPie();
        }else{
            //to prevent focused graph to be removed
        }
    }

    function adjustChartHeight(){

        $('#tcMetrics').css('height',(($('.tcm-container').height() - 30)*100)/$('.tcm-container').height()+'%')

        var parentWidth = $('#metricsContainer').width();
        var parentHeight = $('.tcm-container').height()
        var metrics_controls = $('#metrics-controls').height();
        var previewsWidth = 420;
        var currentChartWidth = $('.graph-container').find('#container').children().width();
        var newChartWidth = parentWidth - previewsWidth;
        var newChartHeight = parentHeight - metrics_controls -100;
        $('.graph-container').find('#container').children().highcharts().setSize(newChartWidth, newChartHeight)
    }

    $(window).resize(function(){

        adjustChartHeight();
    });

    return MetricsView;

});

